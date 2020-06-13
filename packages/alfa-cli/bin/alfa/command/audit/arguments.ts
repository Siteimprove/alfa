import { Argument } from "../../../../src/argument";

export const Arguments = {
  url: Argument.string(
    "url",
    `The URL of the page to audit. Both remote and local protocols are
    supported so the URL can either be an address of a remote page or a path to
    a local file. If no URL is provided, an already serialised page will be read
    from stdin.`
  ).optional(),
};
