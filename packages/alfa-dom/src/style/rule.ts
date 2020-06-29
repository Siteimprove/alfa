import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import * as json from "@siteimprove/alfa-json";

import { Sheet } from "./sheet";

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

import { FontFace } from "./rule/font-face";
import { Import } from "./rule/import";
import { Keyframe } from "./rule/keyframe";
import { Keyframes } from "./rule/keyframes";
import { Media } from "./rule/media";
import { Namespace } from "./rule/namespace";
import { Page } from "./rule/page";
import { Style } from "./rule/style";
import { Supports } from "./rule/supports";
import { Declaration } from "./declaration";

// Export CSSOM rules with a `Rule` postfix to avoid clashes with DOM nodes such
// as `Namespace`.
export {
  FontFace as FontFaceRule,
  Import as ImportRule,
  Keyframe as KeyframeRule,
  Keyframes as KeyframesRule,
  Media as MediaRule,
  Namespace as NamespaceRule,
  Page as PageRule,
  Style as StyleRule,
  Supports as SupportsRule,
};

export namespace Rule {
  export interface JSON {
    [key: string]: json.JSON;
    type: string;
  }

  export function from(json: Style.JSON): Style;

  export function from(json: Import.JSON): Import;

  export function from(json: Media.JSON): Media;

  export function from(json: FontFace.JSON): FontFace;

  export function from(json: Page.JSON): Page;

  export function from(json: Keyframe.JSON): Keyframe;

  export function from(json: Keyframes.JSON): Keyframes;

  export function from(json: Namespace.JSON): Namespace;

  export function from(json: Supports.JSON): Supports;

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
        return Style.fromStyle(json as Style.JSON);

      case "import":
        return Import.fromImport(json as Import.JSON);

      case "media":
        return Media.fromMedia(json as Media.JSON);

      case "font-face":
        return FontFace.fromFontFace(json as FontFace.JSON);

      case "page":
        return Page.fromPage(json as Page.JSON);

      case "keyframes":
        return Keyframes.fromKeyframes(json as Keyframes.JSON);

      case "keyframe":
        return Keyframe.fromKeyframe(json as Keyframe.JSON);

      case "namespace":
        return Namespace.fromNamespace(json as Namespace.JSON);

      case "supports":
        return Supports.fromSupports(json as Supports.JSON);

      default:
        throw new Error(`Unexpected rule of type: ${json.type}`);
    }
  }
}
