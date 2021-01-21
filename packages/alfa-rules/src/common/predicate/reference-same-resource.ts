import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { URL } from "@siteimprove/alfa-url";

/**
 * Check if two elements reference the same resource.
 */
export function referenceSameResource(
  base: URL
): Predicate<Element, [Element]> {
  return (a, b) => {
    if (a.name === b.name) {
      switch (a.name) {
        case "a":
        case "area":
          return a
            .attribute("href")
            .some((a) =>
              URL.parse(a.value, base).some((a) =>
                b
                  .attribute("href")
                  .some((b) =>
                    URL.parse(b.value, base).some((b) => a.equals(b))
                  )
              )
            );

        case "iframe":
          return (
            a
              .attribute("srcdoc")
              .some((a) =>
                b.attribute("srcdoc").some((b) => a.value === b.value)
              ) ||
            a
              .attribute("src")
              .some((a) =>
                URL.parse(a.value, base).some((a) =>
                  b
                    .attribute("src")
                    .some((b) =>
                      URL.parse(b.value, base).some((b) => a.equals(b))
                    )
                )
              )
          );
      }
    }

    return false;
  };
}
