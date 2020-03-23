import { None, Option } from "@siteimprove/alfa-option";
import * as json from "@siteimprove/alfa-json";

import { Sheet } from "./sheet";

export abstract class Rule implements json.Serializable {
  protected readonly _owner: Sheet;
  protected readonly _parent: Option<Rule>;

  protected constructor(owner: Sheet, parent: Option<Rule>) {
    this._owner = owner;
    this._parent = parent;
  }

  public get owner(): Sheet {
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

  public abstract toJSON(): Rule.JSON;
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

  export function fromRule(
    rule: JSON,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Rule {
    switch (rule.type) {
      case "style":
        return Style.fromStyle(rule as Style.JSON, owner, parent);

      case "import":
        return Import.fromImport(rule as Import.JSON, owner, parent);

      case "media":
        return Media.fromMedia(rule as Media.JSON, owner, parent);

      case "font-face":
        return FontFace.fromFontFace(rule as FontFace.JSON, owner, parent);

      case "page":
        return Page.fromPage(rule as Page.JSON, owner, parent);

      case "keyframes":
        return Keyframes.fromKeyframes(rule as Keyframes.JSON, owner, parent);

      case "keyframe":
        return Keyframe.fromKeyframe(rule as Keyframe.JSON, owner, parent);

      case "namespace":
        return Namespace.fromNamespace(rule as Namespace.JSON, owner, parent);

      case "supports":
        return Supports.fromSupports(rule as Supports.JSON, owner, parent);

      default:
        throw new Error(`Unexpected rule of type: ${rule.type}`);
    }
  }
}
