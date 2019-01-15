/// <reference lib="dom" />
/// <reference types="node" />

const url =
  typeof (URL as typeof URL | undefined) === "undefined"
    ? (require("url") as { URL: typeof URL }).URL
    : URL;

export { url as URL };
