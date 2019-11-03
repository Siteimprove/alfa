/// <reference lib="dom" />

import { None, Option, Some } from "@siteimprove/alfa-option";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import {
  isDictionary,
  isKeyword,
  isList,
  isListObject,
  isScalar,
  isValueObject
} from "./guards";
import { Context, Dictionary, Keyword, List, Scalar } from "./types";

const { keys } = Object;

/**
 * @see https://www.w3.org/TR/json-ld-api/#expansion-algorithm
 */
export function expand(
  element: Scalar | List | Dictionary
): Result<List, string> {
  return expandElement({}, null, element).map(element => {
    if (element === null) {
      return [];
    }

    return isList(element) ? element : [element];
  });
}

/**
 * @see https://www.w3.org/TR/json-ld-api/#expansion-algorithm
 */
function expandElement(
  activeContext: Context,
  activeProperty: string | null,
  element: Scalar | List | Dictionary | null
): Result<List | Dictionary | null, string> {
  // 1
  if (element === null) {
    return Ok.of(null);
  }

  // 2
  if (isScalar(element)) {
    // 2.1
    if (activeProperty === null || activeProperty === "@graph") {
      return Ok.of(null);
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

      if (expandedItem.isErr()) {
        return expandedItem;
      }

      for (const item of expandedItem) {
        // 3.2.2
        if (
          activeProperty === "@list" ||
          getMapping(activeContext, activeProperty, "@container") === "@list"
        ) {
          if (isList(item) || isListObject(item)) {
            return Err.of("list of lists");
          }
        }

        // 3.2.3
        if (isList(item)) {
          result.push(...item);
        } else if (item !== null) {
          result.push(item);
        }
      }
    }

    // 3.3
    return Ok.of(result);
  }

  // 4
  const context = element["@context"];

  // 5
  if (context !== undefined) {
    const processedContext = processContext(activeContext, context);

    if (processedContext.isOk()) {
      activeContext = processedContext.get();
    } else {
      return processedContext;
    }
  }

  // 6
  let result: List | Dictionary | null = {};

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

    if (expandedProperty.isErr()) {
      return expandedProperty;
    }

    for (const property of expandedProperty) {
      // 7.3
      if (
        property === null ||
        (!property.includes(":") && !isKeyword(property))
      ) {
        break;
      }

      let expandedValue: Scalar | List | Dictionary | null = null;

      // 7.4
      if (isKeyword(property)) {
        // 7.4.1
        if (activeProperty === "@reverse") {
          return Err.of("invalid reverse property map");
        }

        // 7.4.2
        if (result[property] !== undefined) {
          return Err.of("colliding keywords");
        }

        switch (property) {
          // 7.4.3
          case "@id": {
            if (typeof value !== "string") {
              return Err.of("invalid @id value");
            }

            const expandedIdentifier = expandIdentifier(activeContext, value, {
              documentRelative: true
            });

            if (expandedIdentifier.isErr()) {
              return expandedIdentifier;
            }

            for (const identifier of expandedIdentifier) {
              expandedValue = identifier;
            }
            break;
          }

          // 7.4.4
          case "@type":
            if (typeof value === "string") {
              const expandedIdentifier = expandIdentifier(
                activeContext,
                value,
                {
                  vocab: true,
                  documentRelative: true
                }
              );

              if (expandedIdentifier.isErr()) {
                return expandedIdentifier;
              }

              for (const identifier of expandedIdentifier) {
                expandedValue = identifier;
              }
              break;
            } else if (isList(value)) {
              expandedValue = [];

              for (const item of value) {
                if (typeof item !== "string") {
                  return Err.of("invalid type value");
                }

                const expandedIdentifier = expandIdentifier(
                  activeContext,
                  item,
                  {
                    vocab: true,
                    documentRelative: true
                  }
                );

                if (expandedIdentifier.isErr()) {
                  return expandedIdentifier;
                }

                for (const identifier of expandedIdentifier) {
                  if (identifier !== null) {
                    expandedValue.push(identifier);
                  }
                }
              }

              break;
            } else {
              return Err.of("invalid type value");
            }

          // 7.4.5
          case "@graph": {
            const expandedElement = expandElement(
              activeContext,
              "@graph",
              value
            );

            if (expandedElement.isErr()) {
              return expandedElement;
            }

            for (const element of expandedElement) {
              expandedValue = element;
            }
            break;
          }

          // 7.4.6
          case "@value": {
            if (!isScalar(value) && value !== null) {
              return Err.of("invalid value object value");
            }

            expandedValue = value;

            if (expandedValue === null) {
              result["@value"] = null;
              continue;
            }
            break;
          }

          // 7.4.7
          case "@language":
            if (typeof value !== "string") {
              return Err.of("invalid language-tagged string");
            }

            expandedValue = value.toLowerCase();
            break;

          // 7.4.8
          case "@index":
            if (typeof value !== "string") {
              return Err.of("invalid @index value");
            }

            expandedValue = value;
            break;

          // 7.4.9
          case "@list": {
            // 7.4.9.1
            if (activeProperty === null || activeProperty === "@graph") {
              continue;
            }

            // 7.4.9.2
            const expandedElement = expandElement(
              activeContext,
              activeProperty,
              value
            );

            if (expandedElement.isErr()) {
              return expandedElement;
            }

            for (const element of expandedElement) {
              expandedValue = element;
            }

            // 7.4.9.3
            if (isListObject(expandedValue)) {
              return Err.of("list of lists");
            }
            break;
          }

          // 7.4.10
          case "@set": {
            const expandedElement = expandElement(
              activeContext,
              activeProperty,
              value
            );

            if (expandedElement.isErr()) {
              return expandedElement;
            }

            for (const element of expandedElement) {
              expandedValue = element;
            }
            break;
          }

          // 7.4.11
          case "@reverse": {
            if (!isDictionary(value)) {
              return Err.of("invalid @reverse value");
            }

            // 7.4.11.1
            const expandedElement = expandElement(
              activeContext,
              "@reverse",
              value
            );

            if (expandedElement.isErr()) {
              return expandedElement;
            }

            for (const element of expandedElement) {
              expandedValue = element;
            }

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
                const reverseMap = result["@reverse"] as Dictionary;

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
                      return Err.of("invalid reverse property value");
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
              break;
            }
          }
        }

        // 7.4.12
        if (expandedValue !== null) {
          result[property] = expandedValue;
        }

        // 7.4.13
        break;
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
              return Err.of("invalid language map value");
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
          const expandedElement = expandElement(activeContext, key, indexValue);

          if (expandedElement.isErr()) {
            return expandedElement;
          }

          for (const element of expandedElement) {
            indexValue = element as List;
          }

          // 7.6.2.3
          for (let item of indexValue) {
            item = item as Dictionary;

            // 7.6.2.3.1
            if (item["@index"] === undefined) {
              item["@index"] = index;
            }

            // 7.6.2.3.2
            expandedValue.push(item);
          }
        }
      }

      // 7.7
      else {
        const expandedElement = expandElement(activeContext, key, value);

        if (expandedElement.isErr()) {
          return expandedElement;
        }

        for (const element of expandedElement) {
          expandedValue = element;
        }
      }

      // 7.8
      if (expandedValue === null) {
        break;
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
        const reverseMap = result["@reverse"] as Dictionary;

        // 7.10.3
        if (!isList(expandedValue)) {
          expandedValue = [expandedValue];
        }

        // 7.10.4
        for (const item of expandedValue) {
          // 7.10.4.1
          if (isValueObject(item) || isListObject(item)) {
            return Err.of("invalid reverse property value");
          }

          // 7.10.4.2
          if (reverseMap[property] === undefined) {
            reverseMap[property] = [];
          }

          // 7.10.4.3
          (reverseMap[property] as List).push(item);
        }
      }

      // 7.11
      else {
        // 7.11.1
        if (result[property] === undefined) {
          result[property] = [];
        }

        // 7.11.2
        (result[property] as List).push(expandedValue as Dictionary);
      }
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

      return Err.of("invalid value object");
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
      return Err.of("invalid language-tagged value");
    }

    // 8.4
    else if (
      result["@type"] !== undefined &&
      typeof result["@type"] !== "string"
    ) {
      return Err.of("invalid typed value");
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
      return Err.of("invalid set or list object");
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

  return Ok.of(result);
}

/**
 * @see https://www.w3.org/TR/json-ld-api/#value-expansion
 */
function expandValue(
  activeContext: Context,
  activeProperty: string,
  value: Scalar
): Result<Dictionary, string> {
  const type = getMapping(activeContext, activeProperty, "@type");

  // 1
  if (type === "@id") {
    return expandIdentifier(activeContext, value as string, {
      documentRelative: true
    }).map(id => {
      return { "@id": id };
    });
  }

  // 2
  if (type === "@vocab") {
    return expandIdentifier(activeContext, value as string, {
      documentRelative: true,
      vocab: true
    }).map(id => {
      return { "@id": id };
    });
  }

  // 3
  const result: Dictionary = {
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

  return Ok.of(result);
}

/**
 * @see https://www.w3.org/TR/json-ld-api/#iri-expansion
 */
function expandIdentifier(
  activeContext: Context,
  value: string | null,
  options: expandIdentifier.Options = {}
): Result<string | null, string> {
  const {
    // documentRelative = false,
    vocab = false,
    localContext = null,
    defined = null
  } = options;

  // 1
  if (value === null || isKeyword(value)) {
    return Ok.of(value);
  }

  // 2
  if (
    localContext !== null &&
    localContext[value] !== undefined &&
    defined !== null &&
    defined.get(value) !== true
  ) {
    const err = createTermDefinition(
      activeContext,
      localContext,
      value,
      defined
    );

    if (err.isSome()) {
      return Err.of(err.get());
    }
  }

  // 3
  if (vocab === true) {
    const id = getMapping(activeContext, value, "@id");

    if (id !== null) {
      return Ok.of(id as string);
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
      return Ok.of(value);
    }

    // 4.3
    if (
      localContext !== null &&
      localContext[prefix] !== undefined &&
      defined !== null &&
      defined.get(prefix) !== true
    ) {
      const err = createTermDefinition(
        activeContext,
        localContext,
        prefix,
        defined
      );

      if (err.isSome()) {
        return Err.of(err.get());
      }
    }

    // 4.4
    const id = getMapping(activeContext, prefix, "@id");

    if (id !== null) {
      return Ok.of(`${id}${suffix}`);
    }

    // 4.5
    return Ok.of(value);
  }

  // 5
  if (vocab === true) {
    const vocab = activeContext["@vocab"];

    if (typeof vocab === "string") {
      return Ok.of(`${vocab}${value}`);
    }
  }

  // 7
  return Ok.of(value);
}

namespace expandIdentifier {
  export interface Options {
    readonly documentRelative?: boolean;
    readonly vocab?: boolean;
    readonly localContext?: Context | null;
    readonly defined?: Map<string, boolean> | null;
  }
}

/**
 * @see https://tools.ietf.org/html/rfc3987#section-2.2
 */
const absoluteIri = /^[a-z][a-z0-9+.-]*:\/\//;

/**
 * @see https://www.w3.org/TR/json-ld-api/#dfn-absolute-iri
 */
function isAbsoluteIri(url: string): boolean {
  return absoluteIri.test(url);
}

/**
 * @see https://tools.ietf.org/html/rfc3987#section-2.2
 */
const relativeIri = /^\/\//;

/**
 * @see https://www.w3.org/TR/json-ld-api/#dfn-relative-iri
 */
function isRelativeIri(url: string): boolean {
  return relativeIri.test(url);
}

function resolveUrl(target: string, base: string): string {
  return new URL(target, base).href;
}

function getMapping(
  context: Context,
  property: string | null,
  term: Keyword
): string | boolean | null {
  if (property === null) {
    return null;
  }

  const definition = context[property];

  if (
    definition === null ||
    definition === undefined ||
    !isDictionary(definition)
  ) {
    return null;
  }

  const mapping = definition[term];

  if (typeof mapping !== "string" && typeof mapping !== "boolean") {
    return null;
  }

  return mapping;
}

/**
 * @see https://www.w3.org/TR/json-ld-api/#context-processing-algorithm
 */
function processContext(
  activeContext: Context,
  localContext: Dictionary | List | Scalar | null,
  remoteContexts: Array<Context> = []
): Result<Context, string> {
  // 1
  let result: Context = { ...activeContext };

  // 2
  if (!isList(localContext)) {
    localContext = [localContext];
  }

  // 3
  for (const context of localContext) {
    // 3.1
    if (context === null) {
      result = {};
      continue;
    }

    // 3.2
    if (typeof context === "string") {
      return Err.of("remote contexts are unsupported");
    }

    // 3.3
    if (!isDictionary(context)) {
      return Err.of("invalid local context");
    }

    // 3.4
    if (context["@base"] !== undefined && remoteContexts.length === 0) {
      // 3.4.1
      const value = context["@base"];

      // 3.4.2
      if (value === null) {
        delete result["@base"];
      }

      // 3.4.3
      else if (typeof value === "string" && isAbsoluteIri(value)) {
        result["@base"] = value;
      }

      // 3.4.4
      else if (typeof value === "string" && isRelativeIri(value)) {
        const base = result["@base"];

        if (typeof base === "string") {
          result["@base"] = resolveUrl(value, base);
        }
      }

      // 3.4.5
      else {
        return Err.of("invalid base IRI");
      }
    }

    // 3.5
    if (context["@vocab"] !== undefined) {
      // 3.5.1
      const value = context["@vocab"];

      // 3.5.2
      if (value === null) {
        delete result["@vocab"];
      }

      // 3.5.3
      else if (typeof value === "string" && value.includes(":")) {
        result["@vocab"] = value;
      } else {
        return Err.of("invalid vocab mapping");
      }
    }

    // 3.6
    if (context["@language"] !== undefined) {
      // 3.6.1
      const value = context["@language"];

      // 3.6.2
      if (value === null) {
        delete result["@language"];
      }

      // 3.6.3
      else if (typeof value === "string") {
        result["@language"] = value.toLowerCase();
      } else {
        return Err.of("invalid default language");
      }
    }

    // 3.7
    const defined: Map<string, boolean> = new Map();

    // 3.8
    for (const key of keys(context)) {
      if (typeof key !== "string") {
        continue;
      }

      switch (key) {
        case "@base":
        case "@vocab":
        case "@language":
          continue;
        default:
          const err = createTermDefinition(result, context, key, defined);

          if (err.isSome()) {
            return Err.of(err.get());
          }
      }
    }
  }

  return Ok.of(result);
}

/**
 * @see https://www.w3.org/TR/json-ld-api/#create-term-definition
 */
function createTermDefinition(
  activeContext: Context,
  localContext: Context,
  term: string,
  defined: Map<string, boolean>
): Option<string> {
  // 1
  if (defined.get(term) === true) {
    return None;
  }

  if (defined.get(term) === false) {
    return Some.of("cyclic IRI mapping");
  }

  // 2
  defined.set(term, false);

  // 3
  if (isKeyword(term)) {
    return Some.of("keyword redefinition");
  }

  // 4
  activeContext[term] === undefined;

  // 5
  let value = localContext[term];

  if (value === undefined) {
    return None;
  }

  // 6
  if (value === null || (isDictionary(value) && value["@id"] === null)) {
    activeContext[term] = null;
    defined.set(term, true);
    return None;
  }

  // 7
  if (typeof value === "string") {
    value = { "@id": value };
  }

  // 8
  else if (!isDictionary(value)) {
    return Some.of("invalid term definition");
  }

  // 9
  const definition: Dictionary = {};

  // 10
  if (value["@type"] !== undefined) {
    // 10.1
    let type = value["@type"];

    if (typeof type !== "string") {
      return Some.of("invalid type mapping");
    }

    // 10.2
    const expandedIdentifier = expandIdentifier(activeContext, type, {
      vocab: true,
      localContext,
      defined
    });

    if (expandedIdentifier.isErr()) {
      return Some.of(expandedIdentifier.getErr());
    }

    for (const identifier of expandedIdentifier) {
      type = identifier;
    }

    if (
      type === null ||
      (type !== "@id" && type !== "@vocab" && !isAbsoluteIri(type))
    ) {
      return Some.of("invalid type mapping");
    }

    // 10.3
    definition["@type"] = type;
  }

  // 11
  if (value["@reverse"] !== undefined) {
    const reverse = value["@reverse"];

    // 11.1
    if (value["@id"] !== undefined) {
      return Some.of("invalid reverse property");
    }

    // 11.2
    if (typeof reverse !== "string") {
      return Some.of("invalid IRI mapping");
    }

    // 10.3
    let id: string | null = null;

    const expandedIdentifier = expandIdentifier(activeContext, reverse, {
      vocab: true,
      documentRelative: false,
      localContext,
      defined
    });

    if (expandedIdentifier.isErr()) {
      return Some.of(expandedIdentifier.getErr());
    }

    for (const identifier of expandedIdentifier) {
      id = identifier;
    }

    if (id === null || !id.includes(":")) {
      return Some.of("invalid IRI mapping");
    }

    // 10.4
    if (value["@container"] !== undefined) {
      const container = value["@container"];

      if (
        container !== "@set" &&
        container !== "@index" &&
        container !== null
      ) {
        return Some.of("invalid reverse property");
      }

      definition["@container"] = container;
    }

    // 10.5
    definition["@reverse"] = true;

    // 10.6
    activeContext[term] = definition;
    defined.set(term, true);
    return None;
  }

  // 12
  definition["@reverse"] = false;

  // 13
  if (value["@id"] !== undefined && value["@id"] !== term) {
    let id = value["@id"];

    // 13.1
    if (typeof id !== "string") {
      return Some.of("invalid IRI mapping");
    }

    // 13.2
    const expandedIdentifier = expandIdentifier(activeContext, id, {
      vocab: true,
      documentRelative: true,
      localContext,
      defined
    });

    if (expandedIdentifier.isErr()) {
      return Some.of(expandedIdentifier.getErr());
    }

    for (const identifier of expandedIdentifier) {
      id = identifier;
    }

    if (id === null || (!isKeyword(id) && !id.includes(":"))) {
      return Some.of("invalid IRI mapping");
    }

    if (id === "@context") {
      return Some.of("invalid keyword alias");
    }

    definition["@id"] = id;
  }

  // 14
  else if (term.includes(":")) {
    const position = term.indexOf(":");
    const prefix = term.substring(0, position);
    const suffix = term.substring(position + 1);

    // 14.1
    if (localContext[prefix] !== undefined) {
      const err = createTermDefinition(
        activeContext,
        localContext,
        prefix,
        defined
      );

      if (err.isSome()) {
        return err;
      }
    }

    // 14.2
    const id = getMapping(activeContext, prefix, "@id");

    if (id !== null) {
      definition["@id"] = `${id}${suffix}`;
    }

    // 14.3
    else {
      definition["@id"] = term;
    }
  }

  // 15
  else {
    const vocab = activeContext["@vocab"];

    if (typeof vocab !== "string") {
      return Some.of("invalid IRI mapping");
    }

    definition["@id"] = `${vocab}${term}`;
  }

  // 16
  if (value["@container"] !== undefined) {
    // 16.1
    const container = value["@container"];

    switch (container) {
      case "@list":
      case "@set":
      case "@index":
      case "@language":
        break;
      default:
        return Some.of("invalid container mapping");
    }

    // 16.2
    definition["@container"] = container;
  }

  // 17
  if (value["@language"] !== undefined && value["@type"] === undefined) {
    // 17.1
    const language = value["@language"];

    if (language !== null && typeof language !== "string") {
      return Some.of("invalid language mapping");
    }

    // 17.2
    definition["@language"] =
      typeof language === "string" ? language.toLowerCase() : language;
  }

  // 18
  activeContext[term] = definition;
  defined.set(term, true);

  return None;
}
