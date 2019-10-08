import { Atomic } from "@siteimprove/alfa-act";
import { Attributes, getRole } from "@siteimprove/alfa-aria";
import { List, Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific, Predicate } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Attribute,
  Document,
  Element,
  getId,
  getOwnerElement,
  getRootNode,
  Namespace,
  querySelector,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { URL, values } from "@siteimprove/alfa-util";

import { isRequiredAttribute } from "../helpers/is-required-attribute";
import { isElement, namespaceIs } from "../helpers/predicates";

import { EN } from "./locales/en";

const { map } = BrowserSpecific;

const whitespace = /\s+/;

export const SIA_R19: Atomic.Rule<Document | Device, Attribute> = {
  id: "sanshikan:rules/sia-r19.html",
  requirements: [{ requirement: "aria", partial: true }],
  locales: [EN],
  evaluate: ({ document, device }) => {
    const attributeNames = new Set(
      values(Attributes).map(attribute => attribute.name)
    );

    return {
      applicability: () => {
        return Seq(
          querySelectorAll<Element>(
            document,
            document,
            Predicate.from(
              isElement.and(
                namespaceIs(document, Namespace.HTML, Namespace.SVG)
              )
            ),
            {
              composed: true
            }
          )
        )
          .reduce<List<Attribute>>((attributes, element) => {
            return attributes.concat(
              Array.from(element.attributes).filter(attribute => {
                return (
                  attributeNames.has(attribute.localName) &&
                  attribute.value.trim() !== ""
                );
              })
            );
          }, List())
          .map(attribute => {
            return {
              applicable: true,
              aspect: document,
              target: attribute
            };
          });
      },

      expectations: (aspect, target) => {
        const attribute = values(Attributes).find(
          attribute => attribute.name === target.localName
        )!;

        const { value } = target;

        let valid: boolean | BrowserSpecific<boolean> = true;

        switch (attribute.type) {
          case "true-false":
            valid = value === "true" || value === "false";
            break;

          case "true-false-undefined":
            valid =
              value === "true" || value === "false" || value === "undefined";
            break;

          case "tristate":
            valid = value === "true" || value === "false" || value === "mixed";
            break;

          case "id-reference":
          case "id-reference-list": {
            const owner = getOwnerElement(target, document)!;

            valid = map(getRole(owner, document, device), role => {
              const root = getRootNode(owner, document);

              let hasMatches = false;

              if (attribute.type === "id-reference") {
                if (whitespace.test(value)) {
                  return false;
                }

                hasMatches =
                  querySelector(
                    root,
                    document,
                    Predicate.from(
                      isElement.and(element => getId(element) === value)
                    )
                  ) !== null;
              } else {
                hasMatches = value
                  .trim()
                  .split(whitespace)
                  .some(
                    value =>
                      querySelector(
                        root,
                        document,
                        Predicate.from(
                          isElement.and(element => getId(element) === value)
                        )
                      ) !== null
                  );
              }

              if (
                role !== null &&
                isRequiredAttribute(
                  owner,
                  document,
                  target.localName,
                  role,
                  device
                )
              ) {
                return hasMatches;
              }

              return true;
            });
            break;
          }

          case "integer":
            valid = /^\d+$/.test(value);
            break;

          case "number":
            valid = /^\d+(\.\d+)?$/.test(value);
            break;

          case "token":
            valid =
              [...attribute.values!].find(found => found === value) !==
              undefined;
            break;

          case "token-list":
            valid =
              value
                .split(/\s+/)
                .find(
                  found =>
                    [...attribute.values!].find(value => value === found) ===
                    undefined
                ) === undefined;
            break;

          case "uri":
            try {
              new URL(value);
            } catch (err) {
              valid = false;
            }
        }

        return map(valid, valid => {
          return { 1: { holds: valid } };
        });
      }
    };
  }
};
