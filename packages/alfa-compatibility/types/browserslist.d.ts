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
    browsers?: string | Array<string>,
    options?: BrowserslistOptions
  ): Array<string>;

  export = browserslist;
}
