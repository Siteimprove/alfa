import { keys, Mutable } from "@siteimprove/alfa-util";
import { expandIdentifier } from "./expand";
import { getMapping } from "./get-mapping";
import { isDictionary, isKeyword, isList } from "./guards";
import { isAbsoluteIri } from "./is-absolute-iri";
import { isRelativeIri } from "./is-relative-iri";
import { resolveUrl } from "./resolve-url";
import { Context, Dictionary, List, Scalar } from "./types";

/**
 * @see https://www.w3.org/TR/json-ld-api/#context-processing-algorithm
 *
 * @internal
 */
export function processContext(
  activeContext: Context,
  localContext: Dictionary | List | Scalar | null,
  remoteContexts: Array<Context> = []
): Context {
  // 1
  let result: Mutable<Context> = { ...activeContext };

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
      throw new Error("remote contexts are unsupported");
    }

    // 3.3
    if (!isDictionary(context)) {
      throw new Error("invalid local context");
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
        throw new Error("invalid base IRI");
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
        throw new Error("invalid vocab mapping");
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
        throw new Error("invalid default language");
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
          createTermDefinition(result, context, key, defined);
      }
    }
  }

  return result;
}

/**
 * @see https://www.w3.org/TR/json-ld-api/#create-term-definition
 *
 * @internal
 */
export function createTermDefinition(
  activeContext: Mutable<Context>,
  localContext: Context,
  term: string,
  defined: Map<string, boolean>
): void {
  // 1
  if (defined.get(term) === true) {
    return;
  }

  if (defined.get(term) === false) {
    throw new Error("cyclic IRI mapping");
  }

  // 2
  defined.set(term, false);

  // 3
  if (isKeyword(term)) {
    throw new Error("keyword redefinition");
  }

  // 4
  activeContext[term] === undefined;

  // 5
  let value = localContext[term];

  if (value === undefined) {
    return;
  }

  // 6
  if (value === null || (isDictionary(value) && value["@id"] === null)) {
    activeContext[term] = null;
    defined.set(term, true);
    return;
  }

  // 7
  if (typeof value === "string") {
    value = { "@id": value };
  }

  // 8
  else if (!isDictionary(value)) {
    throw new Error("invalid term definition");
  }

  // 9
  const definition: Mutable<Dictionary> = {};

  // 10
  if (value["@type"] !== undefined) {
    // 10.1
    let type = value["@type"];

    if (typeof type !== "string") {
      throw new Error("invalid type mapping");
    }

    // 10.2
    type = expandIdentifier(activeContext, type, {
      vocab: true,
      localContext,
      defined
    });

    if (
      type === null ||
      (type !== "@id" && type !== "@vocab" && !isAbsoluteIri(type))
    ) {
      throw new Error("invalid type mapping");
    }

    // 10.3
    definition["@type"] = type;
  }

  // 11
  if (value["@reverse"] !== undefined) {
    const reverse = value["@reverse"];

    // 11.1
    if (value["@id"] !== undefined) {
      throw new Error("invalid reverse property");
    }

    // 11.2
    if (typeof reverse !== "string") {
      throw new Error("invalid IRI mapping");
    }

    // 10.3
    const id = expandIdentifier(activeContext, reverse, {
      vocab: true,
      documentRelative: false,
      localContext,
      defined
    });

    if (id === null || !id.includes(":")) {
      throw new Error("invalid IRI mapping");
    }

    // 10.4
    if (value["@container"] !== undefined) {
      const container = value["@container"];

      if (
        container !== "@set" &&
        container !== "@index" &&
        container !== null
      ) {
        throw new Error("invalid reverse property");
      }

      definition["@container"] = container;
    }

    // 10.5
    definition["@reverse"] = true;

    // 10.6
    activeContext[term] = definition;
    defined.set(term, true);
    return;
  }

  // 12
  definition["@reverse"] = false;

  // 13
  if (value["@id"] !== undefined && value["@id"] !== term) {
    let id = value["@id"];

    // 13.1
    if (typeof id !== "string") {
      throw new Error("invalid IRI mapping");
    }

    // 13.2
    id = expandIdentifier(activeContext, id, {
      vocab: true,
      documentRelative: true,
      localContext,
      defined
    });

    if (id === null || (!isKeyword(id) && !id.includes(":"))) {
      throw new Error("invalid IRI mapping");
    }

    if (id === "@context") {
      throw new Error("invalid keyword alias");
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
      createTermDefinition(activeContext, localContext, prefix, defined);
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
      throw new Error("invalid IRI mapping");
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
        throw new Error("invalid container mapping");
    }

    // 16.2
    definition["@container"] = container;
  }

  // 17
  if (value["@language"] !== undefined && value["@type"] === undefined) {
    // 17.1
    const language = value["@language"];

    if (language !== null && typeof language !== "string") {
      throw new Error("invalid language mapping");
    }

    // 17.2
    definition["@language"] =
      typeof language === "string" ? language.toLowerCase() : language;
  }

  // 18
  activeContext[term] = definition;
  defined.set(term, true);
}
