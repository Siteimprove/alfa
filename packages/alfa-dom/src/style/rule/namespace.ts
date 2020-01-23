import { None, Option } from "@siteimprove/alfa-option";

import { Rule } from "../rule";
import { Sheet } from "../sheet";

export class Namespace extends Rule {
  public static of(
    namespace: string,
    prefix: Option<string>,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Namespace {
    return new Namespace(namespace, prefix, owner, parent);
  }

  public readonly namespace: string;
  public readonly prefix: Option<string>;

  private constructor(
    namespace: string,
    prefix: Option<string>,
    owner: Sheet,
    parent: Option<Rule>
  ) {
    super(owner, parent);

    this.namespace = namespace;
    this.prefix = prefix;
  }

  public toJSON(): Namespace.JSON {
    return {
      type: "namespace",
      namespace: this.namespace,
      prefix: this.prefix.getOr(null)
    };
  }

  public toString(): string {
    const prefix = this.prefix.map(prefix => ` ${prefix}`).getOr("");

    return `@namespace ${prefix}url(${this.namespace})`;
  }
}

export namespace Namespace {
  export function isNamespace(value: unknown): value is Namespace {
    return value instanceof Namespace;
  }

  export interface JSON extends Rule.JSON {
    type: "namespace";
    namespace: string;
    prefix: string | null;
  }

  export function fromNamespace(
    json: JSON,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Namespace {
    return Namespace.of(
      json.namespace,
      Option.from(json.prefix),
      owner,
      parent
    );
  }
}
