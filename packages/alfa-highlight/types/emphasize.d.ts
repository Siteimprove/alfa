declare module "emphasize" {
  import * as emphasize from "emphasize/lib/core";

  export = emphasize;
}

declare module "emphasize/lib/core" {
  namespace emphasize {
    interface Sheet {
      readonly [key: string]: (value: string) => string;
    }

    interface HighlightResult {
      language: string;
      relevance: number;
      value: string;
    }

    function highlight(
      language: string,
      value: string,
      sheet?: Sheet
    ): HighlightResult;

    function registerLanguage(name: string, syntax: unknown): void;
  }

  export = emphasize;
}
