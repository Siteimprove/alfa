import { Argument } from "../../../../src/argument";

export const Arguments = {
  url: Argument.string(
    "url",
    `The URL of the page to scrape. Both remote and local protocols are
    supported so the URL can either be an address of a remote page or a path to
    a local file.`
  ),
};
