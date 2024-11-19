import type { Equatable } from "@siteimprove/alfa-equatable";

import type * as earl from "@siteimprove/alfa-earl";
import type * as json from "@siteimprove/alfa-json";

/**
 * @public
 */
export abstract class Requirement<
    T extends string = string,
    U extends string = string,
  >
  implements
    Equatable,
    json.Serializable<Requirement.JSON>,
    earl.Serializable<Requirement.EARL>
{
  private readonly _type: T;
  private readonly _uri: U;

  protected constructor(type: T, uri: U) {
    this._type = type;
    this._uri = uri;
  }

  public get type(): T {
    return this._type;
  }

  public get uri(): U {
    return this._uri;
  }

  public equals(value: Requirement): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Requirement && value.uri === this.uri;
  }

  public toJSON(): Requirement.JSON<T, U> {
    return {
      type: this._type,
      uri: this._uri,
    };
  }

  public toEARL(): Requirement.EARL {
    return {
      "@context": {
        earl: "http://www.w3.org/ns/earl#",
      },
      "@type": ["earl:TestCriterion", "earl:TestRequirement"],
      "@id": this.uri,
    };
  }
}

/**
 * @public
 */
export namespace Requirement {
  export interface JSON<T extends string = string, U extends string = string> {
    [key: string]: json.JSON;
    type: T;
    uri: U;
  }

  export interface EARL extends earl.EARL {
    "@context": {
      earl: "http://www.w3.org/ns/earl#";
    };
    "@type": ["earl:TestCriterion", "earl:TestRequirement"];
    "@id": string;
  }

  export function isRequirement(value: unknown): value is Requirement {
    return value instanceof Requirement;
  }
}
