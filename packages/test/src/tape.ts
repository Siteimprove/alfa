import * as tape from "tape";

type Test = tape.Test;

export { Test };

export function test(
  name: string,
  callback: (test: Test) => Promise<void> | void
): void {
  tape(name, t => {
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
