/// <reference path="../types/url.d.ts" />

const _URL =
  typeof (URL as typeof URL | undefined) === "undefined"
    ? (require("url") as { URL: typeof URL }).URL
    : URL;

export { _URL as URL };
