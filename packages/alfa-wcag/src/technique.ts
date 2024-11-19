import { Requirement } from "@siteimprove/alfa-act";

import { Techniques } from "./technique/data.js";

/**
 * @public
 */
export class Technique<
  N extends Technique.Name = Technique.Name,
> extends Requirement<"technique", Technique.URI<N>> {
  public static of<N extends Technique.Name>(name: N): Technique<N> {
    return new Technique(name, Techniques[name].uri);
  }

  private readonly _name: N;
  private readonly _title: Technique.Title<N>;

  private constructor(name: N, uri: Technique.URI<N>) {
    super("technique", uri);
    this._name = name;
    this._title = Techniques[name].title;
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
    return this._title;
  }

  public toJSON(): Technique.JSON<N> {
    return {
      ...super.toJSON(),
      name: this._name,
      title: this._title,
    };
  }

  public toEARL(): Technique.EARL {
    return {
      ...super.toEARL(),
      "@context": {
        earl: "http://www.w3.org/ns/earl#",
        dct: "http://purl.org/dc/terms/",
      },
      "dct:title": this._title,
      "dct:isPartOf": "https://www.w3.org/WAI/WCAG21/Techniques/",
    };
  }
}

/**
 * @public
 */
export namespace Technique {
  export interface JSON<N extends Technique.Name = Technique.Name>
    extends Requirement.JSON<"technique", Technique.URI<N>> {
    name: Name;
    title: Title;
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
