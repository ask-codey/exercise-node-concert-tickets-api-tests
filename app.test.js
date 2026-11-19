// Your tests for Starlight Stage's tickets API. The README lists the behaviors to cover.
// Run them with: npm test (run npm install once first). See how good they are with: npm run check.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "./app.js";
import { resetData } from "./data.js";

// Every test starts from the shows in data.js, with no tickets sold.
beforeEach(() => {
  resetData();
});

// A worked example, to show the shape. Add your own tests below it.
test("1) GET /shows answers 200 with all 3 shows, in order", async () => {
  const response = await request(app).get("/shows");

  assert.equal(response.status, 200);
  assert.equal(response.headers["content-type"], "application/json; charset=utf-8");
  assert.deepEqual(response.body.map((show) => show.title), ["The Velvet Owls", "Midnight Brass Band", "Juniper Lane"]);
});

// TODO: a test for each of the README's behaviors 2 to 12.
