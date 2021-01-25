import { Requirement } from "@siteimprove/alfa-act";

import { Techniques } from "./technique/data";

export class Technique<
  N extends Technique.Name = Technique.Name
> extends Requirement {
  public static of<N extends Technique.Name>(name: N): Technique<N> {
    return new Technique(name);
  }

  private readonly _name: N;

  private constructor(name: N) {
    super();
    this._name = name;
  }

  /**
   * The name of this technique.
   */
  public get name(): N {
    return this._name;
  }

  /**
   * The title of this technique.
   */
  public get title(): Technique.Title<N> {
    return Techniques[this._name].title;
  }

  /**
   * The URI of this technique.
   */
  public get uri(): Technique.URI<N> {
    return Techniques[this._name].uri;
  }

  public toJSON(): Technique.JSON {
    const { title, uri } = Techniques[this._name];

    return {
      ...super.toJSON(),
      name: this._name,
      title,
      uri,
    };
  }

  public toEARL(): Technique.EARL {
    const { title } = Techniques[this._name];

    return {
      ...super.toEARL(),
      "@context": {
        earl: "http://www.w3.org/ns/earl#",
        dct: "http://purl.org/dc/terms/",
      },
      "dct:title": title,
      "dct:isPartOf": "https://www.w3.org/WAI/WCAG21/Techniques/",
    };
  }
}

export namespace Technique {
  export interface JSON extends Requirement.JSON {
    name: Name;
    title: Title;
    uri: URI;
  }

  export interface EARL extends Requirement.EARL {
    "@context": {
      earl: "http://www.w3.org/ns/earl#";
      dct: "http://purl.org/dc/terms/";
    };
    "dct:title": string;
    "dct:isPartOf": "https://www.w3.org/WAI/WCAG21/Techniques/";
  }

  /**
   * The names of all techniques.
   */
  export type Name = keyof Techniques;

  export function isName(value: string): value is Name {
    return value in Techniques;
  }

  /**
   * The title of the technique with the specified name.
   */
  export type Title<N extends Name = Name> = Techniques[N]["title"];

  /**
   * The URI of the technique with the specified name.
   */
  export type URI<N extends Name = Name> = Techniques[N]["uri"];

  export function isTechnique(value: unknown): value is Technique {
    return value instanceof Technique;
  }
}
