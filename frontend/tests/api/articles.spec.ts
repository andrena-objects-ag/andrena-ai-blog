import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

import {
  authHeaders,
  createArticle,
  expectJsonStatus,
  makeArticlePayload,
  registerAndGetToken,
  withContractNamespace
} from "./helpers";

test.describe("Articles API contracts", () => {
  test("create article requires auth", async ({ request }) => {
    const article = makeArticlePayload("create-unauth");

    const response = await request.post("/api/articles", {
      data: { article }
    });
    await expectJsonStatus(response, 401);
  });

  test("create and get article contract", async ({ request }) => {
    const { user, token } = await registerAndGetToken(request, "create-article");
    const article = makeArticlePayload("create-article");

    const createResponse = await createArticle(request, token, article);
    const createBody = await expectJsonStatus(createResponse, 201);

    expect(createBody.article.title).toBe(article.title);
    expect(createBody.article.description).toBe(article.description);
    expect(createBody.article.body).toBe(article.body);
    expect(createBody.article.tagList).toEqual(article.tagList);
    expect(createBody.article.author.username).toBe(user.username);
    expect(createBody.article.favorited).toBe(false);
    expect(createBody.article.favoritesCount).toBe(0);

    const slug = createBody.article.slug as string;
    const getResponse = await request.get(`/api/articles/${slug}`);
    const getBody = await expectJsonStatus(getResponse, 200);

    expect(getBody.article.slug).toBe(slug);
    expect(getBody.article.title).toBe(article.title);
  });

  test("create article with duplicate title returns 422", async ({ request }) => {
    const { token } = await registerAndGetToken(request, "duplicate-article");
    const article = makeArticlePayload("duplicate-article");

    await createArticle(request, token, article);
    const duplicateResponse = await createArticle(request, token, article);
    const duplicateBody = await expectJsonStatus(duplicateResponse, 422);

    expect(
      duplicateBody.errors.title ?? duplicateBody.errors.slug
    ).toBeTruthy();
  });

  test("update article (owner) regenerates slug", async ({ request }) => {
    const { token } = await registerAndGetToken(request, "update-owner");
    const article = makeArticlePayload("update-owner");
    const createResponse = await createArticle(request, token, article);
    const createBody = await expectJsonStatus(createResponse, 201);
    const slug = createBody.article.slug as string;
    const updatedTitle = `updated-${randomUUID().slice(0, 8)}`;

    const updateResponse = await request.put(`/api/articles/${slug}`, {
      data: {
        article: {
          title: updatedTitle,
          description: "updated description",
          body: "updated body",
          tagList: [withContractNamespace("updated-tag")]
        }
      },
      headers: authHeaders(token)
    });
    const updateBody = await expectJsonStatus(updateResponse, 200);

    expect(updateBody.article.title).toBe(updatedTitle);
    expect(updateBody.article.slug).toBe(updatedTitle);
    expect(updateBody.article.description).toBe("updated description");
    expect(updateBody.article.body).toBe("updated body");
    expect(updateBody.article.tagList).toEqual([
      withContractNamespace("updated-tag")
    ]);
  });

  test("partial update article (owner) succeeds", async ({ request }) => {
    const { token } = await registerAndGetToken(request, "update-partial");
    const article = makeArticlePayload("update-partial");
    const createResponse = await createArticle(request, token, article);
    const createBody = await expectJsonStatus(createResponse, 201);
    const slug = createBody.article.slug as string;
    const updatedTitle = `partial-${randomUUID().slice(0, 8)}`;

    const patchResponse = await request.patch(`/api/articles/${slug}`, {
      data: { article: { title: updatedTitle } },
      headers: authHeaders(token)
    });
    const patchBody = await expectJsonStatus(patchResponse, 200);

    expect(patchBody.article.title).toBe(updatedTitle);
  });

  test("update article (non-owner) returns 404", async ({ request }) => {
    const { token: ownerToken } = await registerAndGetToken(request, "owner");
    const { token: otherToken } = await registerAndGetToken(request, "not-owner");
    const article = makeArticlePayload("not-owner");
    const createResponse = await createArticle(request, ownerToken, article);
    const createBody = await expectJsonStatus(createResponse, 201);
    const slug = createBody.article.slug as string;

    const response = await request.put(`/api/articles/${slug}`, {
      data: { article: { title: "should-not-work" } },
      headers: authHeaders(otherToken)
    });
    await expectJsonStatus(response, 404);
  });

  test("delete article (owner) succeeds", async ({ request }) => {
    const { token } = await registerAndGetToken(request, "delete-owner");
    const article = makeArticlePayload("delete-owner");
    const createResponse = await createArticle(request, token, article);
    const createBody = await expectJsonStatus(createResponse, 201);
    const slug = createBody.article.slug as string;

    const deleteResponse = await request.delete(`/api/articles/${slug}`, {
      headers: authHeaders(token)
    });
    await expectJsonStatus(deleteResponse, 204);

    const getDeletedResponse = await request.get(`/api/articles/${slug}`);
    await expectJsonStatus(getDeletedResponse, 404);
  });

  test("delete article (non-owner) returns 404", async ({ request }) => {
    const { token: ownerToken } = await registerAndGetToken(
      request,
      "delete-non-owner"
    );
    const { token: otherToken } = await registerAndGetToken(
      request,
      "delete-non-owner-other"
    );
    const article = makeArticlePayload("delete-non-owner");
    const createResponse = await createArticle(request, ownerToken, article);
    const createBody = await expectJsonStatus(createResponse, 201);
    const slug = createBody.article.slug as string;

    const response = await request.delete(`/api/articles/${slug}`, {
      headers: authHeaders(otherToken)
    });
    await expectJsonStatus(response, 404);
  });

  test("list articles defaults to 20 items", async ({ request }) => {
    const { user, token } = await registerAndGetToken(request, "list-default");

    for (let i = 0; i < 21; i += 1) {
      await createArticle(request, token, makeArticlePayload(`list-default-${i}`));
    }

    const response = await request.get(`/api/articles?author=${user.username}`);
    const body = await expectJsonStatus(response, 200);

    expect(body.articlesCount).toBe(21);
    expect(body.articles.length).toBe(20);
  });

  test("list articles respects limit", async ({ request }) => {
    const { user, token } = await registerAndGetToken(request, "list-limit");

    for (let i = 0; i < 7; i += 1) {
      await createArticle(request, token, makeArticlePayload(`list-limit-${i}`));
    }

    const response = await request.get(
      `/api/articles?author=${user.username}&limit=5`
    );
    const body = await expectJsonStatus(response, 200);

    expect(body.articlesCount).toBe(7);
    expect(body.articles.length).toBe(5);
  });

  test("list articles supports tag/author/favorited filters", async ({
    request
  }) => {
    const { user: author, token: authorToken } = await registerAndGetToken(
      request,
      "filters-author"
    );
    const { user: fan, token: fanToken } = await registerAndGetToken(
      request,
      "filters-fan"
    );
    const sharedTag = withContractNamespace(`shared-${randomUUID().slice(0, 8)}`);
    const otherTag = withContractNamespace(`other-${randomUUID().slice(0, 8)}`);

    const first = makeArticlePayload("filters-first");
    first.tagList = [sharedTag];
    const second = makeArticlePayload("filters-second");
    second.tagList = [sharedTag];
    const third = makeArticlePayload("filters-third");
    third.tagList = [otherTag];

    const firstResponse = await createArticle(request, authorToken, first);
    const firstBody = await expectJsonStatus(firstResponse, 201);
    const secondResponse = await createArticle(request, authorToken, second);
    const secondBody = await expectJsonStatus(secondResponse, 201);
    const thirdResponse = await createArticle(request, authorToken, third);
    const thirdBody = await expectJsonStatus(thirdResponse, 201);

    await request.post(`/api/articles/${firstBody.article.slug}/favorite`, {
      headers: authHeaders(fanToken)
    });
    await request.post(`/api/articles/${thirdBody.article.slug}/favorite`, {
      headers: authHeaders(fanToken)
    });

    const tagAndAuthorResponse = await request.get(
      `/api/articles?tag=${sharedTag}&author=${author.username}`
    );
    const tagAndAuthorBody = await expectJsonStatus(tagAndAuthorResponse, 200);
    expect(tagAndAuthorBody.articlesCount).toBe(2);

    const favoritedResponse = await request.get(
      `/api/articles?favorited=${fan.username}`
    );
    const favoritedBody = await expectJsonStatus(favoritedResponse, 200);
    const favoritedSlugs = favoritedBody.articles.map(
      (article: { slug: string }) => article.slug
    );
    expect(favoritedBody.articlesCount).toBe(2);
    expect(favoritedSlugs).toContain(firstBody.article.slug);
    expect(favoritedSlugs).toContain(thirdBody.article.slug);
    expect(favoritedSlugs).not.toContain(secondBody.article.slug);
  });

  test("feed requires auth", async ({ request }) => {
    const response = await request.get("/api/articles/feed");
    await expectJsonStatus(response, 401);
  });

  test("feed returns followed authors only", async ({ request }) => {
    const { user: followedAuthor, token: followedAuthorToken } =
      await registerAndGetToken(request, "feed-followed");
    const { token: otherAuthorToken } = await registerAndGetToken(
      request,
      "feed-other"
    );
    const { token: followerToken } = await registerAndGetToken(
      request,
      "feed-follower"
    );

    await request.post(`/api/profiles/${followedAuthor.username}/follow`, {
      headers: authHeaders(followerToken)
    });

    for (let i = 0; i < 3; i += 1) {
      await createArticle(
        request,
        followedAuthorToken,
        makeArticlePayload(`feed-followed-${i}`)
      );
    }
    for (let i = 0; i < 2; i += 1) {
      await createArticle(
        request,
        otherAuthorToken,
        makeArticlePayload(`feed-other-${i}`)
      );
    }

    const response = await request.get("/api/articles/feed", {
      headers: authHeaders(followerToken)
    });
    const body = await expectJsonStatus(response, 200);

    expect(body.articlesCount).toBe(3);
    for (const article of body.articles) {
      expect(article.author.username).toBe(followedAuthor.username);
    }
  });

  test("favorite and unfavorite article toggles flags", async ({ request }) => {
    const { token: authorToken } = await registerAndGetToken(request, "favorite");
    const { token: fanToken } = await registerAndGetToken(
      request,
      "favorite-fan"
    );
    const article = makeArticlePayload("favorite");
    const createResponse = await createArticle(request, authorToken, article);
    const createBody = await expectJsonStatus(createResponse, 201);
    const slug = createBody.article.slug as string;

    const unauthFavorite = await request.post(`/api/articles/${slug}/favorite`);
    await expectJsonStatus(unauthFavorite, 401);

    const favoriteResponse = await request.post(`/api/articles/${slug}/favorite`, {
      headers: authHeaders(fanToken)
    });
    const favoriteBody = await expectJsonStatus(favoriteResponse, 200);
    expect(favoriteBody.article.favorited).toBe(true);
    expect(favoriteBody.article.favoritesCount).toBe(1);

    const unfavoriteResponse = await request.delete(
      `/api/articles/${slug}/favorite`,
      {
        headers: authHeaders(fanToken)
      }
    );
    const unfavoriteBody = await expectJsonStatus(unfavoriteResponse, 200);
    expect(unfavoriteBody.article.favorited).toBe(false);
    expect(unfavoriteBody.article.favoritesCount).toBe(0);
  });
});
