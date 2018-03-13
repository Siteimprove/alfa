import * as tape from "tape";

export type Test = tape.Test;
export type TestOptions = tape.TestOptions;
export type TestCase = (test: Test) => Promise<void> | void;

export function test(name: string, callback: TestCase): void;

export function test(
  name: string,
  options: TestOptions,
  callback: TestCase
): void;

export function test(
  name: string,
  options: TestOptions | TestCase,
  callback: TestCase = () => {}
): void {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }

  tape(name, options, t => {
    try {
      const result = callback(t);

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
