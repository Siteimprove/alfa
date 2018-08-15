declare module "browserslist" {
  interface BrowserslistOptions {
    file: string;
    env: string;
    stats: object;
    config: string;
    ignoreUnknownVersions: boolean;
    dangerousExtend: boolean;
  }

  function browserslist(
    browsers?: string | ReadonlyArray<string>,
    options?: BrowserslistOptions
  ): ReadonlyArray<string>;

  export = browserslist;
}
