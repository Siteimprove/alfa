declare module "ignore" {
  interface Ignore {
    add(pattern: string): this;
    ignores(file: string): boolean;
  }

  function ignore(): Ignore;

  export = ignore;
}
