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

test.describe("Comments and Tags API contracts", () => {
  test("create/list/delete comment contract", async ({ request }) => {
    const { token: authorToken } = await registerAndGetToken(
      request,
      "comments-author"
    );
    const { user: commenter, token: commenterToken } = await registerAndGetToken(
      request,
      "comments-commenter"
    );
    const article = makeArticlePayload("comments");
    const articleResponse = await createArticle(request, authorToken, article);
    const articleBody = await expectJsonStatus(articleResponse, 201);
    const slug = articleBody.article.slug as string;
    const commentsUrl = `/api/articles/${slug}/comments`;

    const unauthCreate = await request.post(commentsUrl, {
      data: { comment: { body: "unauth comment should fail" } }
    });
    await expectJsonStatus(unauthCreate, 401);

    const createResponse = await request.post(commentsUrl, {
      data: { comment: { body: "This is a contract comment." } },
      headers: authHeaders(commenterToken)
    });
    const createBody = await expectJsonStatus(createResponse, 201);

    expect(createBody.comment.body).toBe("This is a contract comment.");
    expect(createBody.comment.author.username).toBe(commenter.username);

    const commentId = createBody.comment.id as number;
    const listResponse = await request.get(commentsUrl);
    const listBody = await expectJsonStatus(listResponse, 200);
    expect(listBody.comments.length).toBe(1);
    expect(listBody.comments[0].id).toBe(commentId);

    const deleteByNonOwner = await request.delete(
      `/api/articles/${slug}/comments/${commentId}`,
      {
        headers: authHeaders(authorToken)
      }
    );
    await expectJsonStatus(deleteByNonOwner, 404);

    const deleteByOwner = await request.delete(
      `/api/articles/${slug}/comments/${commentId}`,
      {
        headers: authHeaders(commenterToken)
      }
    );
    await expectJsonStatus(deleteByOwner, 204);
  });

  test("tags endpoint returns top tags in popularity order", async ({
    request
  }) => {
    const { token } = await registerAndGetToken(request, "tags");
    const tagA = withContractNamespace(`tag-a-${randomUUID().slice(0, 8)}`);
    const tagB = withContractNamespace(`tag-b-${randomUUID().slice(0, 8)}`);
    const tagC = withContractNamespace(`tag-c-${randomUUID().slice(0, 8)}`);

    for (let i = 0; i < 5; i += 1) {
      const article = makeArticlePayload(`tags-a-${i}`);
      article.tagList = [tagA];
      await createArticle(request, token, article);
    }
    for (let i = 0; i < 4; i += 1) {
      const article = makeArticlePayload(`tags-b-${i}`);
      article.tagList = [tagB];
      await createArticle(request, token, article);
    }
    for (let i = 0; i < 3; i += 1) {
      const article = makeArticlePayload(`tags-c-${i}`);
      article.tagList = [tagC];
      await createArticle(request, token, article);
    }

    const response = await request.get("/api/tags");
    const body = await expectJsonStatus(response, 200);

    expect(body.tags).toContain(tagA);
    expect(body.tags).toContain(tagB);
    expect(body.tags).toContain(tagC);
    expect(body.tags.indexOf(tagA)).toBeLessThan(body.tags.indexOf(tagB));
    expect(body.tags.indexOf(tagB)).toBeLessThan(body.tags.indexOf(tagC));
    expect(body.tags.length).toBeLessThanOrEqual(10);
  });
});
