import * as tape from "tape";

const { assign } = Object;

export type Test = tape.Test & { title: string };
export type TestOptions = tape.TestOptions;
export type TestCase = (test: Test) => Promise<void> | void;

export function test(title: string, callback: TestCase): void;

export function test(
  title: string,
  options: TestOptions,
  callback: TestCase
): void;

export function test(
  title: string,
  options: TestOptions | TestCase,
  callback: TestCase = () => {}
): void {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }

  tape(title, options, t => {
    try {
      const result = callback(assign(t, { title }));

      if (result && result.constructor === Promise) {
        result.then(() => t.end()).catch(err => t.error(err));
      } else {
        t.end();
      }
    } catch (err) {
      t.error(err);
    }
  });
}
