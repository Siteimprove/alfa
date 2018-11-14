/// <reference path="./magicpen.d.ts" />

declare module "unexpected" {
  import * as magicpen from "magicpen";

  /**
   * @see http://unexpected.js.org/api/expect/
   */
  function expect<A extends Array<unknown> = []>(
    subject: unknown,
    assertionName: string,
    ...args: A
  ): expect.Unexpected;

  namespace expect {
    type Unexpected = typeof expect;

    interface PluginDefinition {
      name?: string;
      version?: string;
      dependencies?: Array<string>;
      installInto(expect: Unexpected): void;
    }

    interface TypeDefinition<T> {
      name: string;
      identify(value: unknown): value is T;
      base?: string;
      equal?(a: T, b: T, equal: (a: unknown, b: unknown) => boolean): boolean;
      inspect?(
        value: T,
        depth: number,
        output: magicpen.MagicPen,
        inspect: (value: unknown, depth: number) => magicpen.MagicPen
      ): void;
    }

    type AssertionHandler<T, A extends Array<unknown> = []> = (
      expect: Unexpected,
      subject: T,
      ...args: A
    ) => void;

    /**
     * @see http://unexpected.js.org/api/clone/
     */
    function clone(): Unexpected;

    /**
     * @see http://unexpected.js.org/api/addAssertion/
     */
    function addAssertion<T, A extends Array<unknown> = []>(
      pattern: string,
      handler: AssertionHandler<T, A>
    ): Unexpected;

    /**
     * @see http://unexpected.js.org/api/addType/
     */
    function addType<T>(typeDefinition: TypeDefinition<T>): Unexpected;

    /**
     * @see http://unexpected.js.org/api/fail/
     */
    function fail<A extends Array<unknown> = []>(
      format: string,
      ...args: A
    ): void;
    function fail<E extends Error>(error: E): void;

    /**
     * @see http://unexpected.js.org/api/freeze/
     */
    function freeze(): Unexpected;

    /**
     * @see http://unexpected.js.org/api/use/
     */
    function use(plugin: PluginDefinition): Unexpected;
  }

  export = expect;
}
