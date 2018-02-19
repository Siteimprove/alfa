/**
 * Split a string into substrings, using a predicate to determine where to make
 * each split.
 */
export function split(
  string: string,
  predicate: (char: string) => boolean,
  limit?: number
): Array<string> {
  const { length } = string;
  const substrings: Array<string> = [];

  let start = 0;

  while (start < length) {
    let end = start;

    // Move forward until a non-match is found.
    while (!predicate(string[end]) && end < length) {
      end++;
    }

    // Make a split if we moved forward.
    if (start !== end) {
      substrings.push(string.substring(start, end));
    }

    // Move forward past any further matches.
    while (predicate(string[end]) && end < length) {
      end++;
    }

    start = end;
  }

  return substrings;
}
