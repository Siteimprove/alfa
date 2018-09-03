import { Mutable } from "@siteimprove/alfa-util";
import { getMapping } from "./get-mapping";
import {
  isDictionary,
  isKeyword,
  isList,
  isListObject,
  isScalar,
  isValueObject
} from "./guards";
import { createTermDefinition, processContext } from "./process-context";
import { Context, Dictionary, List, Scalar } from "./types";

const { keys } = Object;

/**
 * @see https://www.w3.org/TR/json-ld-api/#expansion-algorithm
 */
export function expand(element: Scalar | List | Dictionary): List {
  const expanded = expandElement({}, null, element);

  if (expanded === null) {
    return [];
  }

  return isList(expanded) ? expanded : [expanded];
}

/**
 * @see https://www.w3.org/TR/json-ld-api/#expansion-algorithm
 *
 * @internal
 */
export function expandElement(
  activeContext: Context,
  activeProperty: string | null,
  element: Scalar | List | Dictionary | null
): List | Dictionary | null {
  // 1
  if (element === null) {
    return null;
  }

  // 2
  if (isScalar(element)) {
    // 2.1
    if (activeProperty === null || activeProperty === "@graph") {
      return null;
    }

    // 2.2
    return expandValue(activeContext, activeProperty, element);
  }

  // 3
  if (isList(element)) {
    // 3.1
    const result: List = [];

    // 3.2
    for (const item of element) {
      // 3.2.1
      const expandedItem = expandElement(activeContext, activeProperty, item);

      // 3.2.2
      if (
        activeProperty === "@list" ||
        getMapping(activeContext, activeProperty, "@container") === "@list"
      ) {
        if (isList(expandedItem) || isListObject(expandedItem)) {
          throw new Error("list of lists");
        }
      }

      // 3.2.3
      if (isList(expandedItem)) {
        result.push(...expandedItem);
      } else if (expandedItem !== null) {
        result.push(expandedItem);
      }
    }

    // 3.3
    return result;
  }

  // 4
  const context = element["@context"];

  // 5
  if (context !== undefined) {
    activeContext = processContext(activeContext, context);
  }

  // 6
  let result: List | Mutable<Dictionary> | null = {};

  // 7
  for (const key of keys(element).sort()) {
    const value = element[key];

    if (value === undefined) {
      continue;
    }

    // 7.1
    if (key === "@context") {
      continue;
    }

    // 7.2
    const expandedProperty = expandIdentifier(activeContext, key, {
      vocab: true
    });

    // 7.3
    if (
      expandedProperty === null ||
      (!expandedProperty.includes(":") && !isKeyword(expandedProperty))
    ) {
      continue;
    }

    let expandedValue: Scalar | List | Dictionary | null = null;

    // 7.4
    if (isKeyword(expandedProperty)) {
      // 7.4.1
      if (activeProperty === "@reverse") {
        throw new Error("invalid reverse property map");
      }

      // 7.4.2
      if (result[expandedProperty] !== undefined) {
        throw new Error("colliding keywords");
      }

      switch (expandedProperty) {
        // 7.4.3
        case "@id":
          if (typeof value !== "string") {
            throw new Error("invalid @id value");
          }

          expandedValue = expandIdentifier(activeContext, value, {
            documentRelative: true
          });
          break;

        // 7.4.4
        case "@type":
          if (typeof value === "string") {
            expandedValue = expandIdentifier(activeContext, value, {
              vocab: true,
              documentRelative: true
            });

            break;
          } else if (isList(value)) {
            expandedValue = [];

            for (const item of value) {
              if (typeof item !== "string") {
                throw new Error("invalid type value");
              }

              const value = expandIdentifier(activeContext, item, {
                vocab: true,
                documentRelative: true
              });

              if (value !== null) {
                expandedValue.push(value);
              }
            }

            break;
          } else {
            throw new Error("invalid type value");
          }

        // 7.4.5
        case "@graph":
          expandedValue = expandElement(activeContext, "@graph", value);
          break;

        // 7.4.6
        case "@value":
          if (!isScalar(value) && value !== null) {
            throw new Error("invalid value object value");
          }

          expandedValue = value;

          if (expandedValue === null) {
            result["@value"] = null;
            continue;
          }
          break;

        // 7.4.7
        case "@language":
          if (typeof value !== "string") {
            throw new Error("invalid language-tagged string");
          }

          expandedValue = value.toLowerCase();
          break;

        // 7.4.8
        case "@index":
          if (typeof value !== "string") {
            throw new Error("invalid @index value");
          }

          expandedValue = value;
          break;

        // 7.4.9
        case "@list":
          // 7.4.9.1
          if (activeProperty === null || activeProperty === "@graph") {
            continue;
          }

          // 7.4.9.2
          expandedValue = expandElement(activeContext, activeProperty, value);

          // 7.4.9.3
          if (isListObject(expandedValue)) {
            throw new Error("list of lists");
          }
          break;

        // 7.4.10
        case "@set":
          expandedValue = expandElement(activeContext, activeProperty, value);
          break;

        // 7.4.11
        case "@reverse":
          if (!isDictionary(value)) {
            throw new Error("invalid @reverse value");
          }

          // 7.4.11.1
          expandedValue = expandElement(activeContext, "@reverse", value);

          if (isDictionary(expandedValue)) {
            // 7.4.11.2
            const reverse = expandedValue["@reverse"];

            if (reverse !== undefined && isDictionary(reverse)) {
              for (const property of keys(reverse)) {
                const item = reverse[property] as Scalar | Dictionary;

                // 7.4.11.2.1
                if (result[property] === undefined) {
                  result[property] = [];
                }

                // 7.4.11.2.2
                (result[property] as List).push(item);
              }
            }

            const members = keys(expandedValue);

            // 7.4.11.3
            if (reverse !== undefined && members.length > 1) {
              // 7.4.11.3.1
              if (result["@reverse"] === undefined) {
                result["@reverse"] = {};
              }

              // 7.4.11.3.2
              const reverseMap = result["@reverse"] as Mutable<Dictionary>;

              // 7.4.11.3.3
              for (const property of members) {
                if (property === "@reverse") {
                  continue;
                }

                const items = expandedValue[property] as List;

                // 7.4.11.3.3.1
                for (const item of items) {
                  // 7.4.11.3.3.1.1
                  if (isValueObject(item) || isListObject(item)) {
                    throw new Error("invalid reverse property value");
                  }

                  // 7.4.11.3.3.1.2
                  if (reverseMap[property] === undefined) {
                    reverseMap[property] = [];
                  }

                  // 7.4.11.3.3.1.3
                  (reverseMap[property] as List).push(item);
                }
              }
            }

            // 7.4.11.3
            continue;
          }
      }

      // 7.4.12
      if (expandedValue !== null) {
        result[expandedProperty] = expandedValue;
      }

      // 7.4.13
      continue;
    }

    // 7.5
    else if (
      getMapping(activeContext, key, "@container") === "@language" &&
      isDictionary(value)
    ) {
      // 7.5.1
      expandedValue = [];

      // 7.5.2
      for (const language of keys(value).sort()) {
        let languageValue = value[language];

        if (languageValue === undefined) {
          continue;
        }

        // 7.5.2.1
        if (!isList(languageValue)) {
          languageValue = [languageValue];
        }

        // 7.5.2.2
        for (const item of languageValue) {
          // 7.5.2.2.1
          if (typeof item !== "string") {
            throw new Error("invalid language map value");
          }

          // 7.5.2.2.2
          expandedValue.push({
            "@value": item,
            "@language": language.toLowerCase()
          });
        }
      }
    }

    // 7.6
    else if (
      getMapping(activeContext, key, "@container") === "@index" &&
      isDictionary(value)
    ) {
      // 7.6.1
      expandedValue = [];

      // 7.6.2
      for (const index of keys(value).sort()) {
        let indexValue = value[index];

        if (indexValue === undefined) {
          continue;
        }

        // 7.6.2.1
        if (!isList(indexValue)) {
          indexValue = [indexValue];
        }

        // 7.6.2.2
        indexValue = expandElement(activeContext, key, indexValue) as List;

        // 7.6.2.3
        for (let item of indexValue) {
          item = item as Dictionary;

          // 7.6.2.3.1
          if (item["@index"] === undefined) {
            (item as Mutable<Dictionary>)["@index"] = index;
          }

          // 7.6.2.3.2
          expandedValue.push(item);
        }
      }
    }

    // 7.7
    else {
      expandedValue = expandElement(activeContext, key, value);
    }

    // 7.8
    if (expandedValue === null) {
      continue;
    }

    // 7.9
    if (
      getMapping(activeContext, key, "@container") === "@list" &&
      !isListObject(expandedValue)
    ) {
      expandedValue = {
        "@list": isList(expandedValue) ? expandedValue : [expandedValue]
      };
    }

    // 7.10
    else if (getMapping(activeContext, key, "@reverse") === true) {
      // 7.10.1
      if (result["@reverse"] === undefined) {
        result["@reverse"] = {};
      }

      // 7.10.2
      const reverseMap = result["@reverse"] as Mutable<Dictionary>;

      // 7.10.3
      if (!isList(expandedValue)) {
        expandedValue = [expandedValue];
      }

      // 7.10.4
      for (const item of expandedValue) {
        // 7.10.4.1
        if (isValueObject(item) || isListObject(item)) {
          throw new Error("invalid reverse property value");
        }

        // 7.10.4.2
        if (reverseMap[expandedProperty] === undefined) {
          reverseMap[expandedProperty] = [];
        }

        // 7.10.4.3
        (reverseMap[expandedProperty] as List).push(item);
      }
    }

    // 7.11
    else {
      // 7.11.1
      if (result[expandedProperty] === undefined) {
        result[expandedProperty] = [];
      }

      // 7.11.2
      (result[expandedProperty] as List).push(expandedValue as Dictionary);
    }
  }

  // 8
  if (result["@value"] !== undefined) {
    // 8.1
    for (const key of keys(result)) {
      switch (key) {
        case "@value":
        case "@index":
          continue;
        case "@language":
          if (result["@type"] === undefined) {
            continue;
          }
          break;
        case "@type":
          if (result["@language"] === undefined) {
            continue;
          }
      }

      throw new Error("invalid value object");
    }

    // 8.2
    if (result["@value"] === null) {
      result = null;
    }

    // 8.3
    else if (
      typeof result["@value"] !== "string" &&
      result["@language"] !== undefined
    ) {
      throw new Error("invalid language-tagged value");
    }

    // 8.4
    else if (
      result["@type"] !== undefined &&
      typeof result["@type"] !== "string"
    ) {
      throw new Error("invalid typed value");
    }
  }

  // 9
  else if (result["@type"] !== undefined) {
    const type = result["@type"]!;

    if (!isList(type)) {
      result["@type"] = [type];
    }
  }

  // 10
  else if (result["@set"] !== undefined || result["@list"] !== undefined) {
    // 10.1
    if (keys(result).length !== 2 && result["@index"] === undefined) {
      throw new Error("invalid set or list object");
    }

    // 10.2
    if (result["@set"] !== undefined) {
      result = result["@set"] as List;
    }
  }

  // 11
  if (
    isDictionary(result) &&
    keys(result).length === 1 &&
    result["@language"] !== undefined
  ) {
    result = null;
  }

  // 12
  if (activeProperty === null || activeProperty === "@graph") {
    if (isDictionary(result)) {
      const members = keys(result);

      // 12.1
      if (
        members.length === 0 ||
        result["@value"] !== undefined ||
        result["@list"] !== undefined
      ) {
        result = null;
      }

      // 12.2
      else if (members.length === 1 && result["@id"] !== undefined) {
        result = null;
      }
    }
  }

  return result;
}

/**
 * @see https://www.w3.org/TR/json-ld-api/#value-expansion
 * @internal
 */
export function expandValue(
  activeContext: Context,
  activeProperty: string,
  value: Scalar
): Dictionary {
  const type = getMapping(activeContext, activeProperty, "@type");

  // 1
  if (type === "@id") {
    return {
      "@id": expandIdentifier(activeContext, value as string, {
        documentRelative: true
      })
    };
  }

  // 2
  if (type === "@vocab") {
    return {
      "@id": expandIdentifier(activeContext, value as string, {
        documentRelative: true,
        vocab: true
      })
    };
  }

  // 3
  const result: Mutable<Dictionary> = {
    "@value": value
  };

  // 4
  if (type !== null) {
    result["@type"] = type;
  }

  // 5
  else if (typeof value === "string") {
    const language = getMapping(activeContext, activeProperty, "@language");

    // 5.1
    if (language !== null) {
      result["@language"] = language;
    }

    // 5.2
    else {
      const language = activeContext["@language"];

      if (language !== undefined) {
        result["@language"] = language;
      }
    }
  }

  return result;
}

/**
 * @see https://www.w3.org/TR/json-ld-api/#iri-expansion
 * @internal
 */
export function expandIdentifier(
  activeContext: Context,
  value: string | null,
  options: Readonly<{
    documentRelative?: boolean;
    vocab?: boolean;
    localContext?: Context | null;
    defined?: Map<string, boolean> | null;
  }> = {}
): string | null {
  const {
    // documentRelative = false,
    vocab = false,
    localContext = null,
    defined = null
  } = options;

  // 1
  if (value === null || isKeyword(value)) {
    return value;
  }

  // 2
  if (
    localContext !== null &&
    localContext[value] !== undefined &&
    defined !== null &&
    defined.get(value) !== true
  ) {
    createTermDefinition(activeContext, localContext, value, defined);
  }

  // 3
  if (vocab === true) {
    const id = getMapping(activeContext, value, "@id");

    if (id !== null) {
      return id as string;
    }
  }

  // 4
  if (value.includes(":")) {
    // 4.1
    const position = value.indexOf(":");
    const prefix = value.substring(0, position);
    const suffix = value.substring(position + 1);

    // 4.2
    if (prefix === "_" || suffix.startsWith("//")) {
      return value;
    }

    // 4.3
    if (
      localContext !== null &&
      localContext[prefix] !== undefined &&
      defined !== null &&
      defined.get(prefix) !== true
    ) {
      createTermDefinition(activeContext, localContext, prefix, defined);
    }

    // 4.4
    const id = getMapping(activeContext, prefix, "@id");
    if (id !== null) {
      return `${id}${suffix}`;
    }

    // 4.5
    return value;
  }

  // 5
  if (vocab === true) {
    const vocab = activeContext["@vocab"];

    if (typeof vocab === "string") {
      return `${vocab}${value}`;
    }
  }

  // 7
  return value;
}
