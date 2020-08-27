import { Option } from "@siteimprove/alfa-option";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Rule } from "../rule";

export class Namespace extends Rule {
  public static of(namespace: string, prefix: Option<string>): Namespace {
    return new Namespace(namespace, prefix);
  }

  private readonly _namespace: string;
  private readonly _prefix: Option<string>;

  private constructor(namespace: string, prefix: Option<string>) {
    super();

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
  export interface JSON extends Rule.JSON {
    type: "namespace";
    namespace: string;
    prefix: string | null;
  }

  export function isNamespace(value: unknown): value is Namespace {
    return value instanceof Namespace;
  }

  /**
   * @internal
   */
  export function fromNamespace(json: JSON): Trampoline<Namespace> {
    return Trampoline.done(
      Namespace.of(json.namespace, Option.from(json.prefix))
    );
  }
}
