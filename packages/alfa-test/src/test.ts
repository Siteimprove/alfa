const path = require("path");
const assert = require("assert").strict;
const Stack = require("error-stack-parser");
const chalk = require("chalk");

const { diff } = require("concordance");
const { theme } = require("concordance-theme-ava");

export interface Assertions {
  /**
   * @see https://nodejs.org/api/assert.html#assert_assert_value_message
   */
  (value: any, message?: string | Error): void;

  /**
   * @see https://nodejs.org/api/assert.html#assert_assert_equal_actual_expected_message
   */
  equal<T>(actual: T, expected: T, message?: string | Error): void;

  /**
   * @see https://nodejs.org/api/assert.html#assert_assert_notequal_actual_expected_message
   */
  notEqual<T>(actual: T, expected: T, message?: string | Error): void;

  /**
   * @see https://nodejs.org/api/assert.html#assert_assert_deepequal_actual_expected_message
   */
  deepEqual<T>(actual: T, expected: T, message?: string | Error): void;

  /**
   * @see https://nodejs.org/api/assert.html#assert_assert_notdeepequal_actual_expected_message
   */
  notDeepEqual<T>(actual: T, expected: T, message?: string | Error): void;

  /**
   * @see https://nodejs.org/api/assert.html#assert_assert_fail_message
   */
  fail(message?: string | Error): void;

  /**
   * @see https://nodejs.org/api/assert.html#assert_assert_ok_value_message
   */
  ok(value: any, message?: string | Error): void;

  /**
   * @see https://nodejs.org/api/assert.html#assert_assert_rejects_block_error_message
   */
  rejects(
    block: Function | Promise<any>,
    error?: RegExp | Function | Object | Error,
    message?: string | Error
  ): void;

  /**
   * @see https://nodejs.org/api/assert.html#assert_assert_throws_block_error_message
   */
  throws(
    block: Function,
    error?: RegExp | Function | Object | Error,
    message?: string | Error
  ): void;
}

export async function test(
  name: string,
  assertion: (assert: Assertions) => void | Promise<void>
): Promise<void> {
  try {
    await assertion(assert);
  } catch (err) {
    let message = "\n" + chalk.bold(name);

    const [location] = Stack.parse(err);

    message +=
      "\n" +
      chalk.gray(
        path.relative(process.cwd(), location.fileName) +
          ":" +
          location.lineNumber
      );

    if ("actual" in err && "expected" in err) {
      message += "\n\n" + "Difference:";
      message += "\n\n" + diff(err.actual, err.expected, { theme });
    }

    console.error(message);

    process.exit(1);
  }
}
