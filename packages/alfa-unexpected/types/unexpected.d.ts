/// <reference path="./magicpen.d.ts" />

// tslint:disable:class-name

declare module "unexpected" {
  import * as magicpen from "magicpen";

  interface unexpected {
    /**
     * @see http://unexpected.js.org/api/expect/
     */
    <A extends Array<unknown> = []>(
      subject: unknown,
      assertionName: string,
      ...args: A
    ): Promise<void>;

    /**
     * @see http://unexpected.js.org/api/clone/
     */
    clone(): this;

    /**
     * @see http://unexpected.js.org/api/addAssertion/
     */
    addAssertion<T, A extends Array<unknown> = []>(
      pattern: string,
      handler: (unexpected: unexpected, subject: T, ...args: A) => void
    ): this;

    /**
     * @see http://unexpected.js.org/api/addType/
     */
    addType<T>(typeDefinition: unexpected.TypeDefinition<T>): this;

    /**
     * @see http://unexpected.js.org/api/fail/
     */
    fail<A extends Array<unknown> = []>(format: string, ...args: A): void;
    fail<E extends Error>(error: E): void;

    /**
     * @see http://unexpected.js.org/api/freeze/
     */
    freeze(): this;

    /**
     * @see http://unexpected.js.org/api/use/
     */
    use(plugin: unexpected.PluginDefinition): this;
  }

  namespace unexpected {
    interface PluginDefinition {
      name?: string;
      version?: string;
      dependencies?: Array<string>;
      installInto(unexpected: unexpected): void;
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
  }

  const unexpected: unexpected;

  export = unexpected;
}
