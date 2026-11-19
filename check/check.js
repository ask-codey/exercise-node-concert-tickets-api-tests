// The check for this exercise: are your tests good enough to catch real bugs?
// It runs your tests (every *.test.js file in the exercise folder) four times:
//   1) against the working app.js: there must be tests, and they must all pass;
//   2) to 4) against three copies of app.js, each with one bug planted in it: your tests must fail on each one.
// Run it with: npm run check (run npm install once first). You don't need to change this file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const project = fileURLToPath(new URL("..", import.meta.url));
const swapHook = new URL("./use-planted-app.js", import.meta.url).href;

// Runs your tests once, with app.js or a planted-bug copy, and counts how many ran and how many failed.
function runYourTests(plantedApp) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  if (plantedApp) {
    env.PLANTED_APP = fileURLToPath(new URL(plantedApp, import.meta.url));
  } else {
    delete env.PLANTED_APP;
  }
  const run = spawnSync(process.execPath, ["--import", swapHook, "--test", "--test-reporter=tap"], {
    cwd: project,
    env,
    encoding: "utf8",
  });
  const count = (name) => Number(run.stdout.match(new RegExp(`^# ${name} ([0-9]+)`, "m"))?.[1] ?? 0);
  return { tests: count("tests"), failed: count("fail") + count("cancelled"), passed: run.status === 0 };
}

const working = runYourTests(null);
const workingPasses = working.tests > 0 && working.failed === 0 && working.passed;

test("1) your tests run and pass on the working app.js", () => {
  assert.ok(working.tests > 0, "There are no tests yet. Write them in app.test.js, then run npm test.");
  assert.equal(
    working.failed,
    0,
    "Some of your tests fail on the working app, so the test is the one to fix. Run npm test to see which.",
  );
});

const plantedBugs = [
  ["2) your tests catch planted bug 1, a wrong status", "./planted-bugs/bug-1/app.js",
    "Check the status code of every answer, not only its body: buying tickets answers 201."],
  ["3) your tests catch planted bug 2, seats that go negative", "./planted-bugs/bug-2/app.js",
    "Try to buy more tickets than a show has left, such as 5 of show 2's 4 seats, and check the answer and the seats left."],
  ["4) your tests catch planted bug 3, a refund that never restores a seat", "./planted-bugs/bug-3/app.js",
    "After a refund, ask for the show again and check its seats left."],
];

for (const [name, file, tip] of plantedBugs) {
  test(name, () => {
    assert.ok(workingPasses, "Get check 1 passing first: a bug only counts as caught when your tests pass on the working app.");
    const run = runYourTests(file);
    assert.ok(run.failed > 0, `Every one of your tests passed on the copy with this bug, so it would reach real fans. ${tip}`);
  });
}
