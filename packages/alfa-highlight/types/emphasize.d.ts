declare module "emphasize" {
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
  }

  export = emphasize;
}
