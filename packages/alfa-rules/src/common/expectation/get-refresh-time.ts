import { None, Option } from "@siteimprove/alfa-option";

const whitespace = /\s/;
const digit = /\d/;

/**
 * Parse the content attribute of a <meta http-equiv="refresh" content ="…" /> element
 * and return the time before the refresh occurs.
 *
 * @see https://html.spec.whatwg.org/#attr-meta-http-equiv-refresh
 */
export function getRefreshTime(content: string): Option<number> {
  if (content.length === 0) {
    return None;
  }

  let i = 0;

  while (whitespace.test(content[i])) {
    i++;
  }

  const start = i;

  while (digit.test(content[i])) {
    i++;
  }

  if (start === i) {
    return None;
  }

  const next = content[i];

  // As long as the time of the refresh is ended correctly, the URL won't matter
  // in terms of the validity of the refresh. If the URL is therefore invalid,
  // the refresh will simply redirect to the current page.
  if (next !== undefined && next !== ";" && next !== ",") {
    return None;
  }

  return Option.of(parseInt(content.substring(start, i), 10));
}
