import { join } from "node:path";
import { test } from "@japa/runner";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

test.group("Service Provider Profile", async (group) => {
  // In my app I'm doing a database transaction
  // ------------------------------------------
  // group.each.setup(async () => {
  //   await Database.beginGlobalTransaction();
  //   return async () => await Database.rollbackGlobalTransaction();
  // });

  // but this is needed to trigger the hang
  // --------------------------------------
  group.each.setup(async () => {
    await sleep(1);
    return async () => await sleep(1);
  });

  test("display welcome page", async ({ client }) => {
    const response = await client.get("/");

    response.assertStatus(200);
    response.assertBodyContains({ hello: "world" });
  });

  test("upload doesn't hang", async ({ client }) => {
    const response = await client
      .post(`/api/v1/upload`) // route is not real
      .file("avatar", join(__dirname, "file.jpg"));
  });

  test("upload hangs", async ({ client }) => {
    const response = await client
      .post(`/api/v1/upload`) // route is not real
      .file("avatar", join(__dirname, "../does/not/exist/", "file.jpg"));
  });
});
