import { Array } from "@siteimprove/alfa-array";
import { Rule } from "../rule";
import { GroupingRule } from "./grouping";
import { Option } from "@siteimprove/alfa-option";

/**
 * Model for CSS layers
 * 
 * @remarks
 * There is actually two kind of @layer rules: block and statements.
 * Both are introduced by the same keyword, and work closely together,
 * hence they are kept here for better cohesion. They are, however,
 * represented as separated Classes, with separated `type`, mimicking the two
 * JS interfaces that exist in native DOM.
 * 
 * @public
 */
namespace Layer {
    /**
     * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/@layer}
     * {@link https://drafts.csswg.org/css-cascade-5/#layer-empty}
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/CSSLayerStatementRule}
     */
    export class Statement extends Rule<"layer-statement"> {
        public static of(layers: Iterable<string>): Statement {
            return new Statement(Array.from(layers))
        }

        private readonly _layers: Array<string>

        private constructor(layers: Array<string>) {
            super("layer-statement")
            this._layers = layers
        }

        public get layers(): Iterable<string> {
            return this._layers
        }

        public toJSON(): Statement.JSON {
            return {
                ...super.toJSON(),
                layers: this._layers
            }
        }

        public toString(): string {
            return `@layer ${this._layers.join(", ")};`
        }
    }

    export namespace Statement {
        export interface JSON extends Rule.JSON<"layer-statement"> {
            layers: Array<string>
        }

        export function fromLayerStatementRule(json: JSON): Statement {
            return Statement.of(json.layers)
        }
    }

    /**
     * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/@layer}
     * {@link https://drafts.csswg.org/css-cascade-5/#layer-block}
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/CSSLayerBlockRule}
     */
    export class Block extends GroupingRule<"layer-block"> {
        public static of(rules: Iterable<Rule>, layer?: string): Block {
            return new Block(Option.from(layer), Array.from(rules))
        }

        private readonly _layer: Option<string>

        private constructor(layer: Option<string>, rules: Array<Rule>) {
            super("layer-block", rules)
            this._layer = layer
        }

        public get layer(): Option<string> {
            return this._layer
        }

        public equals(value: unknown): value is this {
            return value instanceof Block && value._layer.equals(this._layer) && super.equals(value)
        }

        public toJSON(): Block.JSON {
            return {
                ...super.toJSON(),
                layer: this._layer.getOr(null)
            }
        }

        public toString(): string {
            return `@layer ${this._layer.isSome() ? this._layer.getUnsafe() + " " : ""}`
        }
    }

    export namespace Block {
        export interface JSON extends GroupingRule.JSON<"layer-block"> {
            layer: string | null
        }
    }
}