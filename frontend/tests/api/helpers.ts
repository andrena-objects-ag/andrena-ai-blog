import { randomUUID } from "node:crypto";

import { APIRequestContext, APIResponse, expect } from "@playwright/test";

export type UserPayload = {
  username: string;
  email: string;
  password: string;
};

export type ArticlePayload = {
  title: string;
  description: string;
  body: string;
  tagList: string[];
};

const contractNamespace = process.env.API_CONTRACTS_NAMESPACE?.trim();

export const withContractNamespace = (value: string): string => {
  if (!contractNamespace) {
    return value;
  }
  return `${contractNamespace}_${value}`;
};

export const makeUserPayload = (prefix = "contract"): UserPayload => {
  const scopedPrefix = withContractNamespace(prefix);
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  return {
    username: `${scopedPrefix}_${suffix}`,
    email: `${scopedPrefix}_${suffix}@example.com`,
    password: "password123"
  };
};

export const makeArticlePayload = (prefix = "contract"): ArticlePayload => {
  const scopedPrefix = withContractNamespace(prefix);
  const suffix = randomUUID().replaceAll("-", "").slice(0, 10);
  return {
    title: `${scopedPrefix} title ${suffix}`,
    description: `${scopedPrefix} description ${suffix}`,
    body: `${scopedPrefix} body ${suffix}`,
    tagList: [withContractNamespace(`${prefix}-tag-${suffix}`)]
  };
};

export const authHeaders = (
  token: string,
  scheme: "Token" | "Bearer" = "Token"
) => ({
  Authorization: `${scheme} ${token}`
});

const parseResponseBody = async (response: APIResponse) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const expectJsonStatus = async (
  response: APIResponse,
  statusCode: number
) => {
  const body = await parseResponseBody(response);
  expect(
    response.status(),
    `Unexpected status with body: ${JSON.stringify(body)}`
  ).toBe(statusCode);
  return body;
};

export const registerUser = (request: APIRequestContext, user: UserPayload) =>
  request.post("/api/users", {
    data: { user }
  });

export const loginUser = (request: APIRequestContext, user: UserPayload) =>
  request.post("/api/users/login", {
    data: { user: { email: user.email, password: user.password } }
  });

export const registerAndGetToken = async (
  request: APIRequestContext,
  prefix = "contract"
) => {
  const user = makeUserPayload(prefix);
  const registerResponse = await registerUser(request, user);
  const registerBody = await expectJsonStatus(registerResponse, 201);

  return {
    user,
    token: registerBody.user.token as string
  };
};

export const createArticle = (
  request: APIRequestContext,
  token: string,
  article: ArticlePayload
) =>
  request.post("/api/articles", {
    data: { article },
    headers: authHeaders(token)
  });
