import type { Trampoline } from "@siteimprove/alfa-trampoline";
import type { Sheet } from "../sheet.js";

import { FontFaceRule } from "./font-face.js";
import { GroupingRule } from "./grouping.js";
import { ImportRule } from "./import.js";
import { KeyframeRule } from "./keyframe.js";
import { KeyframesRule } from "./keyframes.js";
import { Layer as LayerRules } from "./layer.js";
import { MediaRule } from "./media.js";
import { NamespaceRule } from "./namespace.js";
import { PageRule } from "./page.js";
import { StyleRule } from "./style.js";
import { SupportsRule } from "./supports.js";

import type { BaseRule } from "./rule.js";

/**
 * @public
 */
export type Rule =
  | Rule.FontFace
  | Rule.Grouping
  | Rule.Import
  | Rule.Keyframe
  | Rule.Keyframes
  | Rule.Layer.Block
  | Rule.Layer.Statement
  | Rule.Media
  | Rule.Namespace
  | Rule.Page
  | Rule.Style
  | Rule.Supports;

/**
 * @public
 */
export namespace Rule {
  export import FontFace = FontFaceRule;
  export import Grouping = GroupingRule;
  export import Import = ImportRule;
  export import Keyframe = KeyframeRule;
  export import Keyframes = KeyframesRule;
  export namespace Layer {
    export import Block = LayerRules.BlockRule;
    export import Statement = LayerRules.StatementRule;
  }
  export import Media = MediaRule;
  export import Namespace = NamespaceRule;
  export import Page = PageRule;
  export import Style = StyleRule;
  export import Supports = SupportsRule;

  export type JSON =
    | FontFace.JSON
    | Grouping.JSON
    | Import.JSON
    | Keyframe.JSON
    | Keyframes.JSON
    | Layer.Block.JSON
    | Layer.Statement.JSON
    | Media.JSON
    | Namespace.JSON
    | Page.JSON
    | Style.JSON
    | Supports.JSON;

  export const { of: fontFace, isFontFaceRule } = FontFace;
  export const { of: importRule, isImportRule } = Import;
  export const { of: keyframe, isKeyframeRule } = Keyframe;
  export const { of: keyframes, isKeyframesRule } = Keyframes;
  export const { of: layerBlock, isLayerBlockRule } = Layer.Block;
  export const { of: layerStatement, isLayerStatementRule } = Layer.Statement;
  export const { of: media, isMediaRule } = Media;
  export const { of: namespace, isNamespaceRule } = Namespace;
  export const { of: page, isPageRule } = Page;
  export const { of: style, isStyleRule } = Style;
  export const { of: supports, isSupportsRule } = Supports;

  export function from(
    json: FontFace.JSON,
    sheetFactory: (rules: Iterable<Rule>) => Sheet,
  ): FontFace;

  export function from(
    json: Import.JSON,
    sheetFactory: (rules: Iterable<Rule>) => Sheet,
  ): Import;

  export function from(
    json: Keyframe.JSON,
    sheetFactory: (rules: Iterable<Rule>) => Sheet,
  ): Keyframe;

  export function from(
    json: Keyframes.JSON,
    sheetFactory: (rules: Iterable<Rule>) => Sheet,
  ): Keyframes;

  export function from(
    json: Layer.Block.JSON,
    sheetFactory: (rules: Iterable<Rule>) => Sheet,
  ): Layer.Block;

  export function from(
    json: Layer.Statement.JSON,
    sheetFactory: (rules: Iterable<Rule>) => Sheet,
  ): Layer.Statement;

  export function from(
    json: Media.JSON,
    sheetFactory: (rules: Iterable<Rule>) => Sheet,
  ): Media;

  export function from(
    json: Namespace.JSON,
    sheetFactory: (rules: Iterable<Rule>) => Sheet,
  ): Namespace;

  export function from(
    json: Page.JSON,
    sheetFactory: (rules: Iterable<Rule>) => Sheet,
  ): Page;

  export function from(
    json: Style.JSON,
    sheetFactory: (rules: Iterable<Rule>) => Sheet,
  ): Style;

  export function from(
    json: Supports.JSON,
    sheetFactory: (rules: Iterable<Rule>) => Sheet,
  ): Supports;

  export function from(
    json: Rule.JSON,
    sheetFactory: (rules: Iterable<Rule>) => Sheet,
  ): Rule;

  export function from(
    json: Rule.JSON,
    sheetFactory: (rules: Iterable<Rule>) => Sheet,
  ): Rule {
    return fromRule(sheetFactory)(json).run();
  }

  /**
   * @internal
   */
  export function fromRule(
    sheetFactory: (rules: Iterable<Rule>) => Sheet,
  ): (json: Rule.JSON) => Trampoline<Rule> {
    return function from(json: Rule.JSON): Trampoline<Rule> {
      switch (json.type) {
        case "font-face":
          return FontFace.fromFontFaceRule(json as FontFace.JSON);

        case "import":
          return Import.fromImportRule(
            json as Import.JSON,
            from,
            sheetFactory as (rules: Iterable<BaseRule>) => Sheet,
          );

        case "keyframe":
          return Keyframe.fromKeyframeRule(json as Keyframe.JSON);

        case "keyframes":
          return Keyframes.fromKeyframesRule(json as Keyframes.JSON, from);

        case "layer-block":
          return Layer.Block.fromLayerBlockRule(json as Layer.Block.JSON, from);

        case "layer-statement":
          return Layer.Statement.fromLayerStatementRule(
            json as Layer.Statement.JSON,
          );

        case "media":
          return Media.fromMediaRule(json as Media.JSON, from);

        case "namespace":
          return Namespace.fromNamespaceRule(json as Namespace.JSON);

        case "page":
          return Page.fromPageRule(json as Page.JSON);

        case "style":
          return Style.fromStyleRule(json as Style.JSON);

        case "supports":
          return Supports.fromSupportsRule(json as Supports.JSON, from);

        default:
          throw new Error(`Unexpected rule of type: ${json.type}`);
      }
    };
  }
}
