/// <reference types="node" />
/// <reference path="../types/url.d.ts" />

const url =
  typeof (URL as typeof URL | undefined) === "undefined"
    ? (require("url") as { URL: typeof URL }).URL
    : URL;

export { url as URL };
