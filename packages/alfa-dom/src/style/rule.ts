import type { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import type { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";
import type { Trampoline } from "@siteimprove/alfa-trampoline";

import type * as json from "@siteimprove/alfa-json";

import type { Sheet } from "./sheet.js";

import {
  FontFaceRule,
  ImportRule,
  KeyframeRule,
  KeyframesRule,
  Layer,
  MediaRule,
  NamespaceRule,
  PageRule,
  StyleRule,
  SupportsRule,
} from "../index.js";

/**
 * @public
 */
export abstract class Rule<T extends string = string>
  implements Equatable, Serializable
{
  protected _owner: Option<Sheet> = None;
  protected _parent: Option<Rule> = None;
  private readonly _type: T;

  protected constructor(type: T) {
    this._type = type;
  }

  public get type(): T {
    return this._type;
  }

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

  public *inclusiveAncestors(): Iterable<Rule> {
    yield this;
    yield* this.ancestors();
  }

  public equals(value: unknown): value is this {
    return value === this;
  }

  public toJSON(): Rule.JSON<T> {
    return { type: this._type };
  }

  /**
   * @internal
   */
  public _attachOwner(owner: Sheet): boolean {
    if (this._owner.isSome()) {
      return false;
    }

    this._owner = Option.of(owner);

    // Recursively attach the owner to all children.
    return Iterable.every(this.children(), (rule) => rule._attachOwner(owner));
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

/**
 * @public
 */
export namespace Rule {
  export interface JSON<T extends string = string> {
    [key: string]: json.JSON;
    type: T;
  }

  export function from(json: FontFaceRule.JSON): FontFaceRule;

  export function from(json: ImportRule.JSON): ImportRule;

  export function from(json: KeyframeRule.JSON): KeyframeRule;

  export function from(json: KeyframesRule.JSON): KeyframesRule;

  export function from(json: Layer.BlockRule.JSON): Layer.BlockRule;

  export function from(json: Layer.StatementRule.JSON): Layer.StatementRule;

  export function from(json: MediaRule.JSON): MediaRule;

  export function from(json: NamespaceRule.JSON): NamespaceRule;

  export function from(json: PageRule.JSON): PageRule;

  export function from(json: StyleRule.JSON): StyleRule;

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
      case "font-face":
        return FontFaceRule.fromFontFaceRule(json as FontFaceRule.JSON);

      case "import":
        return ImportRule.fromImportRule(json as ImportRule.JSON);

      case "keyframe":
        return KeyframeRule.fromKeyframeRule(json as KeyframeRule.JSON);

      case "keyframes":
        return KeyframesRule.fromKeyframesRule(json as KeyframesRule.JSON);

      case "layer-block":
        return Layer.BlockRule.fromLayerBlockRule(json as Layer.BlockRule.JSON);

      case "layer-statement":
        return Layer.StatementRule.fromLayerStatementRule(
          json as Layer.StatementRule.JSON,
        );

      case "media":
        return MediaRule.fromMediaRule(json as MediaRule.JSON);

      case "namespace":
        return NamespaceRule.fromNamespaceRule(json as NamespaceRule.JSON);

      case "page":
        return PageRule.fromPageRule(json as PageRule.JSON);

      case "style":
        return StyleRule.fromStyleRule(json as StyleRule.JSON);

      case "supports":
        return SupportsRule.fromSupportsRule(json as SupportsRule.JSON);

      default:
        throw new Error(`Unexpected rule of type: ${json.type}`);
    }
  }
}
