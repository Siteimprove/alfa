/**
 * @internal
 */
export namespace Text {
  export function indent(text: string, indent: string | number = "  "): string {
    return text.replace(
      /^/gm,
      typeof indent === "string" ? indent : " ".repeat(indent)
    );
  }

  export function wrap(text: string, length: number = 80): string {
    if (text.length > length) {
      let target = length;

      while (target > 0 && !/\s/.test(text[target])) {
        target--;
      }

      if (target > 0) {
        const left = text.substring(0, target);
        const right = text.substring(target + 1);

        return left + "\n" + wrap(right, length);
      }
    }

    return text;
  }
}
