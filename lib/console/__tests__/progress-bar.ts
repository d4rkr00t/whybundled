// @ts-expect-error
import fixtures from "fixturez";
import stripAnsi from "strip-ansi";
import test from "ava";
import { createProgressBar } from "../progress-bar";

const f = fixtures(__dirname);

[
  { progress: 0 },
  { progress: 30, title: "title", text: "text" },
  { progress: 50, text: "text" },
  { progress: 75, title: "title" },
  { progress: 100 },
].forEach((testCase) => {
  test(`should output correct progress for ${JSON.stringify(
    testCase
  )}`, (t) => {
    const writes: Array<string> = [];
    const stdout = {
      columns: 100,
      write(str: string) {
        writes.push(stripAnsi(str || ""));
      },
    };
    const updateProgressBar = createProgressBar(stdout as NodeJS.WriteStream);
    updateProgressBar(testCase);
    t.snapshot(writes);
  });
});
