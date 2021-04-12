import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import * as json from "@siteimprove/alfa-json";

import { Sheet } from "./sheet";

import {
  FontFaceRule,
  ImportRule,
  KeyframeRule,
  KeyframesRule,
  MediaRule,
  NamespaceRule,
  PageRule,
  StyleRule,
  SupportsRule,
} from "..";

export abstract class Rule implements Equatable, Serializable {
  protected _owner: Option<Sheet> = None;
  protected _parent: Option<Rule> = None;

  protected constructor() {}

  public get owner(): Option<Sheet> {
    return this._owner;
  }

  public get parent(): Option<Rule> {
    return this._parent;
  }

  public *children(): Iterable<Rule> {}

  public *descendants(): Iterable<Rule> {
    for (const child of this.children()) {
      yield child;
      yield* child.descendants();
    }
  }

  public *ancestors(): Iterable<Rule> {
    for (const parent of this._parent) {
      yield parent;
      yield* parent.ancestors();
    }
  }

  public equals(value: unknown): value is this {
    return value === this;
  }

  public abstract toJSON(): Rule.JSON;

  /**
   * @internal
   */
  public _attachOwner(owner: Sheet): boolean {
    if (this._owner.isSome()) {
      return false;
    }

    this._owner = Option.of(owner);

    return true;
  }

  /**
   * @internal
   */
  public _attachParent(parent: Rule): boolean {
    if (this._parent.isSome()) {
      return false;
    }

    this._parent = Option.of(parent);

    return true;
  }
}

export namespace Rule {
  export interface JSON {
    [key: string]: json.JSON;
    type: string;
  }

  export function from(json: StyleRule.JSON): StyleRule;

  export function from(json: ImportRule.JSON): ImportRule;

  export function from(json: MediaRule.JSON): MediaRule;

  export function from(json: FontFaceRule.JSON): FontFaceRule;

  export function from(json: PageRule.JSON): PageRule;

  export function from(json: KeyframeRule.JSON): KeyframeRule;

  export function from(json: KeyframesRule.JSON): KeyframesRule;

  export function from(json: NamespaceRule.JSON): NamespaceRule;

  export function from(json: SupportsRule.JSON): SupportsRule;

  export function from(json: JSON): Rule;

  export function from(json: JSON): Rule {
    return fromRule(json).run();
  }

  /**
   * @internal
   */
  export function fromRule(json: JSON): Trampoline<Rule> {
    switch (json.type) {
      case "style":
        return StyleRule.fromStyleRule(json as StyleRule.JSON);

      case "import":
        return ImportRule.fromImportRule(json as ImportRule.JSON);

      case "media":
        return MediaRule.fromMediaRule(json as MediaRule.JSON);

      case "font-face":
        return FontFaceRule.fromFontFaceRule(json as FontFaceRule.JSON);

      case "page":
        return PageRule.fromPageRule(json as PageRule.JSON);

      case "keyframe":
        return KeyframeRule.fromKeyframeRule(json as KeyframeRule.JSON);

      case "keyframes":
        return KeyframesRule.fromKeyframesRule(json as KeyframesRule.JSON);

      case "namespace":
        return NamespaceRule.fromNamespaceRule(json as NamespaceRule.JSON);

      case "supports":
        return SupportsRule.fromSupportsRule(json as SupportsRule.JSON);

      default:
        throw new Error(`Unexpected rule of type: ${json.type}`);
    }
  }
}
