/**
 * @public
 */
export interface Assertions {
  /**
   * {@link https://nodejs.org/api/assert.html#assert_assert_value_message}
   */
  <T>(value: T, message?: string): void;

  /**
   * {@link https://nodejs.org/api/assert.html#assert_assert_equal_actual_expected_message}
   */
  equal<T>(actual: T, expected: T, message?: string): void;

  /**
   * {@link https://nodejs.org/api/assert.html#assert_assert_notequal_actual_expected_message}
   */
  notEqual<T>(actual: T, expected: T, message?: string): void;

  /**
   * {@link https://nodejs.org/api/assert.html#assert_assert_deepequal_actual_expected_message}
   */
  deepEqual<T>(actual: T, expected: T, message?: string): void;

  /**
   * {@link https://nodejs.org/api/assert.html#assert_assert_notdeepequal_actual_expected_message}
   */
  notDeepEqual<T>(actual: T, expected: T, message?: string): void;

  /**
   * {@link https://nodejs.org/api/assert.html#assert_assert_fail_message}
   */
  fail(message?: string): never;

  /**
   * {@link https://nodejs.org/api/assert.html#assert_assert_throws_block_error_message}
   */
  throws(
    block: Function,
    error?: RegExp | Function | Object | Error,
    message?: string,
  ): void;
}
