import { expect, test } from "@playwright/test";

import {
  authHeaders,
  expectJsonStatus,
  registerAndGetToken
} from "./helpers";

test.describe("Profiles API contracts", () => {
  test("get profile works unauthenticated", async ({ request }) => {
    const { user } = await registerAndGetToken(request, "profile-public");

    const response = await request.get(`/api/profiles/${user.username}`);
    const body = await expectJsonStatus(response, 200);

    expect(body.profile.username).toBe(user.username);
    expect(body.profile.email).toBe(user.email);
    expect(body.profile.following).toBe(false);
  });

  test("get profile works authenticated", async ({ request }) => {
    const { user: targetUser } = await registerAndGetToken(
      request,
      "profile-target"
    );
    const { token: viewerToken } = await registerAndGetToken(
      request,
      "profile-viewer"
    );

    const response = await request.get(`/api/profiles/${targetUser.username}`, {
      headers: authHeaders(viewerToken)
    });
    const body = await expectJsonStatus(response, 200);

    expect(body.profile.username).toBe(targetUser.username);
    expect(body.profile.following).toBe(false);
  });

  test("follow user returns following=true", async ({ request }) => {
    const { user: targetUser } = await registerAndGetToken(
      request,
      "follow-target"
    );
    const { token: followerToken } = await registerAndGetToken(
      request,
      "follow-follower"
    );

    const response = await request.post(
      `/api/profiles/${targetUser.username}/follow`,
      {
        headers: authHeaders(followerToken)
      }
    );
    const body = await expectJsonStatus(response, 200);

    expect(body.profile.username).toBe(targetUser.username);
    expect(body.profile.following).toBe(true);
  });

  test("unfollow user returns following=false", async ({ request }) => {
    const { user: targetUser } = await registerAndGetToken(
      request,
      "unfollow-target"
    );
    const { token: followerToken } = await registerAndGetToken(
      request,
      "unfollow-follower"
    );

    await request.post(`/api/profiles/${targetUser.username}/follow`, {
      headers: authHeaders(followerToken)
    });

    const response = await request.delete(
      `/api/profiles/${targetUser.username}/follow`,
      {
        headers: authHeaders(followerToken)
      }
    );
    const body = await expectJsonStatus(response, 200);

    expect(body.profile.username).toBe(targetUser.username);
    expect(body.profile.following).toBe(false);
  });
});
