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

  private readonly _namespace: string;
  private readonly _prefix: Option<string>;

  private constructor(
    namespace: string,
    prefix: Option<string>,
    owner: Sheet,
    parent: Option<Rule>
  ) {
    super(owner, parent);

    this._namespace = namespace;
    this._prefix = prefix;
  }

  public get namespace(): string {
    return this._namespace;
  }

  public get prefix(): Option<string> {
    return this._prefix;
  }

  public toJSON(): Namespace.JSON {
    return {
      type: "namespace",
      namespace: this._namespace,
      prefix: this._prefix.getOr(null),
    };
  }

  public toString(): string {
    const prefix = this._prefix.map((prefix) => ` ${prefix}`).getOr("");

    return `@namespace ${prefix}url(${this._namespace})`;
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
