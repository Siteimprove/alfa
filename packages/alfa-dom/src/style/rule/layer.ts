import { Array } from "@siteimprove/alfa-array";
import { Option } from "@siteimprove/alfa-option";
import { String } from "@siteimprove/alfa-string";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Rule } from "../rule";
import { GroupingRule } from "./grouping";

/**
 * Model for CSS layers
 *
 * @remarks
 * There are actually two kinds of `@layer` rules: block and statements.
 * Both are introduced by the same keyword, and work closely together,
 * hence they are kept here for better cohesion. They are, however,
 * represented as separated Classes, with separated `type`, mimicking the two
 * JS interfaces that exist in native DOM.
 *
 * @public
 */
export namespace Layer {
  /**
   * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/@layer}
   * {@link https://drafts.csswg.org/css-cascade-5/#layer-empty}
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/CSSLayerStatementRule}
   */
  export class StatementRule extends Rule<"layer-statement"> {
    public static of(layers: Iterable<string>): StatementRule {
      return new StatementRule(Array.from(layers));
    }

    private readonly _layers: Array<string>;

    private constructor(layers: Array<string>) {
      super("layer-statement");
      this._layers = layers;
    }

    public get layers(): Iterable<string> {
      return this._layers;
    }

    public toJSON(): StatementRule.JSON {
      return {
        ...super.toJSON(),
        layers: this._layers,
      };
    }

    public toString(): string {
      return `@layer ${this._layers.join(", ")};`;
    }
  }

  export namespace StatementRule {
    export interface JSON extends Rule.JSON<"layer-statement"> {
      layers: Array<string>;
    }

    export function fromLayerStatementRule(
      json: JSON,
    ): Trampoline<StatementRule> {
      return Trampoline.done(StatementRule.of(json.layers));
    }

    export function isLayerStatementRule(
      value: unknown,
    ): value is StatementRule {
      return value instanceof StatementRule;
    }
  }

  /**
   * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/@layer}
   * {@link https://drafts.csswg.org/css-cascade-5/#layer-block}
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/CSSLayerBlockRule}
   */
  export class BlockRule extends GroupingRule<"layer-block"> {
    public static of(rules: Iterable<Rule>, layer?: string | null): BlockRule {
      return new BlockRule(Option.from(layer), Array.from(rules));
    }

    private readonly _layer: Option<string>;

    private constructor(layer: Option<string>, rules: Array<Rule>) {
      super("layer-block", rules);
      this._layer = layer;
    }

    public get layer(): Option<string> {
      return this._layer;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof BlockRule &&
        value._layer.equals(this._layer) &&
        super.equals(value)
      );
    }

    public toJSON(): BlockRule.JSON {
      return {
        ...super.toJSON(),
        layer: this._layer.getOr(null),
      };
    }

    public toString(): string {
      const rules = this._rules
        .map((rule) => String.indent(rule.toString()))
        .join("\n\n");

      return `@layer ${this._layer.isSome() ? this._layer.getUnsafe() + " " : ""}{${
        rules === "" ? "" : `\n${rules}\n`
      }}`;
    }
  }

  export namespace BlockRule {
    export interface JSON extends GroupingRule.JSON<"layer-block"> {
      layer: string | null;
    }

    export function fromLayerBlockRule(json: JSON): Trampoline<BlockRule> {
      return Trampoline.traverse(json.rules, Rule.fromRule).map((rules) =>
        BlockRule.of(rules, json.layer),
      );
    }

    export function isLayerBlockRule(value: unknown): value is BlockRule {
      return value instanceof BlockRule;
    }
  }
}
