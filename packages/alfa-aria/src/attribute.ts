import { Cache } from "@siteimprove/alfa-cache";
import { Equality } from "@siteimprove/alfa-equality";
import { None, Option } from "@siteimprove/alfa-option";

export class Attribute<N extends string = string>
  implements Equality<Attribute<N>> {
  public static of<N extends string>(
    name: N,
    type: Attribute.Type,
    value: Attribute.Value,
    valid: Option<Iterable<string>> = None,
    implicit: Option<string> = None,
    status: Attribute.Status = { deprecated: false }
  ): Attribute<N> {
    return new Attribute(name, type, value, valid, implicit, status);
  }

  public readonly name: N;
  public readonly type: Attribute.Type;
  public readonly value: Attribute.Value;
  public readonly valid: Option<Iterable<string>>;
  public readonly implicit: Option<string>;
  public readonly status: Attribute.Status;

  private constructor(
    name: N,
    type: Attribute.Type,
    value: Attribute.Value,
    valid: Option<Iterable<string>>,
    implicit: Option<string>,
    status: Attribute.Status
  ) {
    this.name = name;
    this.type = type;
    this.valid = valid;
    this.value = value;
    this.implicit = implicit;
    this.status = status;
  }

  public equals(value: unknown): value is Attribute<N> {
    return value instanceof Attribute && value.name === this.name;
  }
}

export namespace Attribute {
  export const enum Type {
    /**
     * @see https://www.w3.org/TR/wai-aria/#dfn-state
     */
    State = "state",

    /**
     * @see https://www.w3.org/TR/wai-aria/#dfn-property
     */
    Property = "property"
  }

  export type Value =
    /**
     * @see https://www.w3.org/TR/wai-aria/#valuetype_true-false
     */
    | "true-false"

    /**
     * @see https://www.w3.org/TR/wai-aria/#valuetype_true-false-undefined
     */
    | "true-false-undefined"

    /**
     * @see https://www.w3.org/TR/wai-aria/#valuetype_tristate
     */
    | "tristate"

    /**
     * @see https://www.w3.org/TR/wai-aria/#valuetype_idref
     */
    | "id-reference"

    /**
     * @see https://www.w3.org/TR/wai-aria/#valuetype_idref_list
     */
    | "id-reference-list"

    /**
     * @see https://www.w3.org/TR/wai-aria/#valuetype_integer
     */
    | "integer"

    /**
     * @see https://www.w3.org/TR/wai-aria/#valuetype_number
     */
    | "number"

    /**
     * @see https://www.w3.org/TR/wai-aria/#valuetype_string
     */
    | "string"

    /**
     * @see https://www.w3.org/TR/wai-aria/#valuetype_token
     */
    | "token"

    /**
     * @see https://www.w3.org/TR/wai-aria/#valuetype_token_list
     */
    | "token-list"

    /**
     * @see https://www.w3.org/TR/wai-aria/#valuetype_uri
     */
    | "uri";

  export interface Status {
    readonly deprecated: boolean;
  }

  const attributes = Cache.empty<string, Attribute>();

  export function register<N extends string>(
    attribute: Attribute<N>
  ): Attribute<N> {
    attributes.set(attribute.name, attribute);
    return attribute;
  }

  export function lookup<N extends string>(name: N): Option<Attribute<N>> {
    return attributes.get(name) as Option<Attribute<N>>;
  }
}

namespace State {
  export function of<N extends string>(
    name: N,
    value: Attribute.Value,
    valid?: Option<Iterable<string>>,
    implicit?: Option<string>,
    status?: Attribute.Status
  ): Attribute<N> {
    return Attribute.of(
      name,
      Attribute.Type.State,
      value,
      valid,
      implicit,
      status
    );
  }
}

namespace Property {
  export function of<N extends string>(
    name: N,
    value: Attribute.Value,
    valid?: Option<Iterable<string>>,
    implicit?: Option<string>,
    status?: Attribute.Status
  ): Attribute<N> {
    return Attribute.of(
      name,
      Attribute.Type.Property,
      value,
      valid,
      implicit,
      status
    );
  }
}

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-activedescendant
 */
Attribute.register(Property.of("aria-activedescendant", "id-reference"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-atomic
 */
Attribute.register(Property.of("aria-atomic", "true-false"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-autocomplete
 */
Attribute.register(
  Property.of(
    "aria-autocomplete",
    "token",
    Option.of(["inline", "list", "both", "none"])
  )
);

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-busy
 */
Attribute.register(State.of("aria-busy", "true-false"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-checked
 */
Attribute.register(State.of("aria-checked", "tristate"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-colcount
 */
Attribute.register(Property.of("aria-colcount", "integer"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-colindex
 */
Attribute.register(Property.of("aria-colindex", "integer"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-colspan
 */
Attribute.register(Property.of("aria-colspan", "integer"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-controls
 */
Attribute.register(Property.of("aria-controls", "id-reference-list"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-current
 */
Attribute.register(
  State.of(
    "aria-current",
    "token",
    Option.of(["page", "step", "location", "date", "time", "true", "false"])
  )
);

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-describedby
 */
Attribute.register(Property.of("aria-describedby", "id-reference-list"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-details
 */
Attribute.register(Property.of("aria-details", "id-reference"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-disabled
 */
Attribute.register(State.of("aria-disabled", "true-false"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-dropeffect
 */
Attribute.register(
  Property.of(
    "aria-dropeffect",
    "token-list",
    Option.of(["copy", "execute", "link", "move", "none", "popup"]),
    None,
    { deprecated: true }
  )
);

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-errormessage
 */
Attribute.register(Property.of("aria-errormessage", "id-reference"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-expanded
 */
Attribute.register(State.of("aria-expanded", "true-false-undefined"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-flowto
 */
Attribute.register(Property.of("aria-flowto", "id-reference-list"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-grabbed
 */
Attribute.register(
  State.of("aria-grabbed", "true-false-undefined", None, None, {
    deprecated: true
  })
);

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-haspopup
 */
Attribute.register(
  Property.of(
    "aria-haspopup",
    "token",
    Option.of(["false", "true", "menu", "listbox", "tree", "grid", "dialog"])
  )
);

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-hidden
 */
Attribute.register(State.of("aria-hidden", "true-false-undefined"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-invalid
 */
Attribute.register(
  State.of(
    "aria-invalid",
    "token",
    Option.of(["grammar", "false", "spelling", "true"])
  )
);

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-keyshortcuts
 */
Attribute.register(Property.of("aria-keyshortcuts", "string"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-label
 */
Attribute.register(Property.of("aria-label", "string"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-labelledby
 */
Attribute.register(Property.of("aria-labelledby", "id-reference-list"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-level
 */
Attribute.register(Property.of("aria-level", "integer"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-live
 */
Attribute.register(
  Property.of("aria-live", "token", Option.of(["assertive", "off", "polite"]))
);

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-modal
 */
Attribute.register(Property.of("aria-modal", "true-false"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-multiline
 */
Attribute.register(Property.of("aria-multiline", "true-false"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-multiselectable
 */
Attribute.register(Property.of("aria-multiselectable", "true-false"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-orientation
 */
Attribute.register(
  Property.of(
    "aria-orientation",
    "token",
    Option.of(["horizontal", "undefined", "vertical"])
  )
);

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-owns
 */
Attribute.register(Property.of("aria-owns", "id-reference-list"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-placeholder
 */
Attribute.register(Property.of("aria-placeholder", "string"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-posinset
 */
Attribute.register(Property.of("aria-posinset", "integer"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-pressed
 */
Attribute.register(State.of("aria-pressed", "tristate"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-readonly
 */
Attribute.register(Property.of("aria-readonly", "true-false"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-relevant
 */
Attribute.register(
  Property.of(
    "aria-relevant",
    "token-list",
    Option.of(["additions", "all", "removals", "text"])
  )
);

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-required
 */
Attribute.register(Property.of("aria-required", "true-false"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-roledescription
 */
Attribute.register(Property.of("aria-roledescription", "string"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-rowcount
 */
Attribute.register(Property.of("aria-rowcount", "integer"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-rowindex
 */
Attribute.register(Property.of("aria-rowindex", "integer"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-rowspan
 */
Attribute.register(Property.of("aria-rowspan", "integer"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-selected
 */
Attribute.register(State.of("aria-selected", "true-false-undefined"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-setsize
 */
Attribute.register(Property.of("aria-setsize", "integer"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-sort
 */
Attribute.register(
  Property.of(
    "aria-sort",
    "token",
    Option.of(["ascending", "descending", "none", "other"])
  )
);

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-valuemax
 */
Attribute.register(Property.of("aria-valuemax", "number"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-valuemin
 */
Attribute.register(Property.of("aria-valuemin", "number"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-valuenow
 */
Attribute.register(Property.of("aria-valuenow", "number"));

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-valuetext
 */
Attribute.register(Property.of("aria-valuetext", "string"));
