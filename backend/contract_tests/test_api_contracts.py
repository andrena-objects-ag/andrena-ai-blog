import json
from uuid import uuid4

from rest_framework import status
from rest_framework.test import APITestCase


class TestAPIContracts(APITestCase):
    users_url = "/api/users"
    login_url = "/api/users/login"
    user_url = "/api/user"
    articles_url = "/api/articles"
    tags_url = "/api/tags"

    @staticmethod
    def _json(response):
        return json.loads(response.content)

    @staticmethod
    def _unique_user_payload():
        suffix = uuid4().hex[:12]
        return {
            "username": f"contract_{suffix}",
            "email": f"contract_{suffix}@example.com",
            "password": "password123",
        }

    @staticmethod
    def _auth_headers(token, scheme="Token"):
        return {"Authorization": f"{scheme} {token}"}

    def _register_user(self, user):
        return self.client.post(self.users_url, {"user": user})

    def _login_user(self, user):
        return self.client.post(
            self.login_url,
            {"user": {"email": user["email"], "password": user["password"]}},
        )

    def _register_and_get_token(self):
        user = self._unique_user_payload()
        register_response = self._register_user(user)
        self.assertEqual(
            register_response.status_code, status.HTTP_201_CREATED
        )
        body = self._json(register_response)
        return user, body["user"]["token"]

    def test_register_user_contract(self):
        user = self._unique_user_payload()

        response = self._register_user(user)
        body = self._json(response)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(body["user"]["token"])
        self.assertEqual(body["user"]["username"], user["username"])
        self.assertEqual(body["user"]["email"], user["email"])
        self.assertIsNone(body["user"].get("password"))

    def test_register_duplicate_user_contract(self):
        user = self._unique_user_payload()
        self._register_user(user)

        response = self._register_user(user)
        body = self._json(response)

        self.assertEqual(
            response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY
        )
        self.assertIsNotNone(body["errors"]["email"])
        self.assertIsNotNone(body["errors"]["username"])

    def test_login_user_contract(self):
        user = self._unique_user_payload()
        self._register_user(user)

        response = self._login_user(user)
        body = self._json(response)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(body["user"]["email"], user["email"])
        self.assertEqual(body["user"]["username"], user["username"])
        self.assertIsNotNone(body["user"]["token"])
        self.assertIsNone(body["user"].get("password"))

    def test_login_invalid_credentials_contract(self):
        user = self._unique_user_payload()

        response = self._login_user(user)
        body = self._json(response)

        self.assertEqual(
            response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY
        )
        self.assertEqual(
            body["errors"]["non_field_errors"][0], "Invalid email or password"
        )

    def test_get_current_user_requires_auth_contract(self):
        response = self.client.get(self.user_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_current_user_supports_token_and_bearer_contract(self):
        user, token = self._register_and_get_token()

        token_response = self.client.get(
            self.user_url, headers=self._auth_headers(token, scheme="Token")
        )
        token_body = self._json(token_response)
        self.assertEqual(token_response.status_code, status.HTTP_200_OK)
        self.assertEqual(token_body["user"]["username"], user["username"])

        bearer_response = self.client.get(
            self.user_url, headers=self._auth_headers(token, scheme="Bearer")
        )
        bearer_body = self._json(bearer_response)
        self.assertEqual(bearer_response.status_code, status.HTTP_200_OK)
        self.assertEqual(bearer_body["user"]["username"], user["username"])

    def test_article_create_and_read_contract(self):
        user, token = self._register_and_get_token()
        suffix = uuid4().hex[:10]
        article_payload = {
            "title": f"Contract Title {suffix}",
            "description": f"Contract Description {suffix}",
            "body": f"Contract Body {suffix}",
            "tagList": [f"contract-tag-{suffix}"],
        }

        create_response = self.client.post(
            self.articles_url,
            {"article": article_payload},
            headers=self._auth_headers(token),
        )
        create_body = self._json(create_response)

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            create_body["article"]["title"], article_payload["title"]
        )
        self.assertEqual(
            create_body["article"]["description"],
            article_payload["description"],
        )
        self.assertEqual(
            create_body["article"]["body"], article_payload["body"]
        )
        self.assertEqual(
            create_body["article"]["tagList"], article_payload["tagList"]
        )
        self.assertEqual(
            create_body["article"]["author"]["username"], user["username"]
        )
        self.assertEqual(create_body["article"]["favorited"], False)
        self.assertEqual(create_body["article"]["favoritesCount"], 0)

        slug = create_body["article"]["slug"]
        get_response = self.client.get(f"{self.articles_url}/{slug}")
        get_body = self._json(get_response)

        self.assertEqual(get_response.status_code, status.HTTP_200_OK)
        self.assertEqual(get_body["article"]["slug"], slug)
        self.assertEqual(
            get_body["article"]["title"], article_payload["title"]
        )

    def test_articles_filter_by_author_contract(self):
        user, token = self._register_and_get_token()
        for index in range(2):
            suffix = uuid4().hex[:8]
            self.client.post(
                self.articles_url,
                {
                    "article": {
                        "title": f"Contract Filter Title {index}-{suffix}",
                        "description": (
                            f"Contract Filter Description {index}-{suffix}"
                        ),
                        "body": f"Contract Filter Body {index}-{suffix}",
                        "tagList": [f"contract-filter-{suffix}"],
                    }
                },
                headers=self._auth_headers(token),
            )

        response = self.client.get(
            f"{self.articles_url}?author={user['username']}&limit=20"
        )
        body = self._json(response)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(body["articlesCount"], 2)
        self.assertEqual(len(body["articles"]), 2)
        for article in body["articles"]:
            self.assertEqual(article["author"]["username"], user["username"])

    def test_comment_create_and_list_contract(self):
        _, author_token = self._register_and_get_token()
        commenter, commenter_token = self._register_and_get_token()
        suffix = uuid4().hex[:10]

        article_response = self.client.post(
            self.articles_url,
            {
                "article": {
                    "title": f"Comment Contract Title {suffix}",
                    "description": f"Comment Contract Description {suffix}",
                    "body": f"Comment Contract Body {suffix}",
                    "tagList": [f"comment-contract-{suffix}"],
                }
            },
            headers=self._auth_headers(author_token),
        )
        article_slug = self._json(article_response)["article"]["slug"]
        comments_url = f"{self.articles_url}/{article_slug}/comments"

        create_comment_response = self.client.post(
            comments_url,
            {"comment": {"body": "This is a contract comment."}},
            headers=self._auth_headers(commenter_token),
        )
        create_comment_body = self._json(create_comment_response)

        self.assertEqual(
            create_comment_response.status_code, status.HTTP_201_CREATED
        )
        self.assertEqual(
            create_comment_body["comment"]["author"]["username"],
            commenter["username"],
        )
        self.assertEqual(
            create_comment_body["comment"]["body"],
            "This is a contract comment.",
        )

        list_comments_response = self.client.get(comments_url)
        list_comments_body = self._json(list_comments_response)

        self.assertEqual(
            list_comments_response.status_code, status.HTTP_200_OK
        )
        self.assertEqual(len(list_comments_body["comments"]), 1)

    def test_validation_error_shape_contract(self):
        _, token = self._register_and_get_token()

        response = self.client.post(
            self.articles_url,
            {
                "article": {
                    "description": "Missing title and body",
                    "tagList": [],
                }
            },
            headers=self._auth_headers(token),
        )
        body = self._json(response)

        self.assertEqual(
            response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY
        )
        self.assertIsNotNone(body["errors"]["title"])
        self.assertIsNotNone(body["errors"]["body"])

    def test_tags_endpoint_shape_contract(self):
        response = self.client.get(self.tags_url)
        body = self._json(response)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(body["tags"], list)
