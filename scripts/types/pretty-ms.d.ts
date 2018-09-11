declare module "pretty-ms" {
  interface Options {
    compact?: boolean;
    keepDecimalsOnWholeSeconds?: boolean;
    msDecimalDigits?: number;
    secDecimalDigits?: number;
    verbose?: boolean;
  }

  function prettyMs(input: Number, options?: Options): string;

  export = prettyMs;
}
