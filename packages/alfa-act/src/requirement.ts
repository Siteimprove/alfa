import { Equatable } from "@siteimprove/alfa-equatable";

import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";

export abstract class Requirement
  implements Equatable, json.Serializable, earl.Serializable {
  protected readonly _uri: string;

  protected constructor(uri: string) {
    this._uri = uri;
  }

  public get uri(): string {
    return this._uri;
  }

  public equals(value: unknown): value is this {
    return value instanceof Requirement && value._uri === this._uri;
  }

  public toJSON(): Requirement.JSON {
    return {
      uri: this._uri,
    };
  }

  public toEARL(): Requirement.EARL {
    return {
      "@context": {
        earl: "http://www.w3.org/ns/earl#",
      },
      "@type": ["earl:TestCriterion", "earl:TestRequirement"],
      "@id": this._uri,
    };
  }
}

export namespace Requirement {
  export interface JSON {
    [key: string]: json.JSON;
    uri: string;
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
