import { expect, test } from "@playwright/test";

import {
  authHeaders,
  expectJsonStatus,
  loginUser,
  makeUserPayload,
  registerAndGetToken,
  registerUser
} from "./helpers";

test.describe("Users & Auth API contracts", () => {
  test("register returns wrapped user with token", async ({ request }) => {
    const user = makeUserPayload("register");

    const response = await registerUser(request, user);
    const body = await expectJsonStatus(response, 201);

    expect(body.user.username).toBe(user.username);
    expect(body.user.email).toBe(user.email);
    expect(body.user.token).toBeTruthy();
    expect(body.user.password).toBeUndefined();
  });

  test("duplicate registration returns 422 errors wrapper", async ({
    request
  }) => {
    const user = makeUserPayload("duplicate");
    await registerUser(request, user);

    const response = await registerUser(request, user);
    const body = await expectJsonStatus(response, 422);

    expect(body.errors.email).toBeTruthy();
    expect(body.errors.username).toBeTruthy();
  });

  test("login with valid credentials returns wrapped user", async ({
    request
  }) => {
    const user = makeUserPayload("login");
    await registerUser(request, user);

    const response = await loginUser(request, user);
    const body = await expectJsonStatus(response, 200);

    expect(body.user.email).toBe(user.email);
    expect(body.user.username).toBe(user.username);
    expect(body.user.token).toBeTruthy();
    expect(body.user.password).toBeUndefined();
  });

  test("login with invalid credentials returns 422", async ({ request }) => {
    const user = makeUserPayload("invalid-login");

    const response = await loginUser(request, user);
    const body = await expectJsonStatus(response, 422);

    expect(body.errors.non_field_errors[0]).toBe(
      "Invalid email or password"
    );
  });

  test("current user endpoint requires auth", async ({ request }) => {
    const response = await request.get("/api/user");
    await expectJsonStatus(response, 401);
  });

  test("current user endpoint accepts Token and Bearer auth", async ({
    request
  }) => {
    const { user, token } = await registerAndGetToken(request, "auth-header");

    const tokenResponse = await request.get("/api/user", {
      headers: authHeaders(token, "Token")
    });
    const tokenBody = await expectJsonStatus(tokenResponse, 200);
    expect(tokenBody.user.username).toBe(user.username);

    const bearerResponse = await request.get("/api/user", {
      headers: authHeaders(token, "Bearer")
    });
    const bearerBody = await expectJsonStatus(bearerResponse, 200);
    expect(bearerBody.user.username).toBe(user.username);
  });

  test("update current user persists fields", async ({ request }) => {
    const { user, token } = await registerAndGetToken(request, "update");
    const updatePayload = {
      user: {
        username: `${user.username}_updated`,
        bio: "updated bio from contract test",
        image: "https://example.com/avatar.png"
      }
    };

    const response = await request.put("/api/user", {
      data: updatePayload,
      headers: authHeaders(token)
    });
    const body = await expectJsonStatus(response, 200);

    expect(body.user.username).toBe(updatePayload.user.username);
    expect(body.user.bio).toBe(updatePayload.user.bio);
    expect(body.user.image).toBe(updatePayload.user.image);
  });

  test("update current user with taken email returns 422", async ({
    request
  }) => {
    const { token: tokenOne } = await registerAndGetToken(request, "update-a");
    const { user: userTwo } = await registerAndGetToken(request, "update-b");

    const response = await request.put("/api/user", {
      data: { user: { email: userTwo.email } },
      headers: authHeaders(tokenOne)
    });
    const body = await expectJsonStatus(response, 422);

    expect(body.errors.email).toBeTruthy();
  });
});
