import { Array } from "@siteimprove/alfa-array";
import { Rule } from "@siteimprove/alfa-dom";

import { Block } from "../../dist/block.js";
import { Layer } from "../../dist/index.js";
import { UserAgent } from "../../dist/user-agent.js";

/**
 * @internal
 */
export function layer(
  name: string,
  order: number,
): { normal: Layer<true>; important: Layer<true> } {
  return {
    normal: Layer.of(name, false).withOrder(-order),
    important: Layer.of(name, true).withOrder(order),
  };
}

const implicitLayer = layer("", 1);

/**
 * @internal
 */
export function ruleToBlockJSON(
  rule: Rule.Style,
  order: number,
  encapsulationDepth: number = 1,
  layer: { normal: Layer<true>; important: Layer<true> } = implicitLayer,
): Array<Block.JSON<Block.Source>> {
  return Array.toJSON(Block.from(rule, order, encapsulationDepth, layer)[0]);
}

/**
 * @internal
 */
export function getBlock(
  rule: Rule.Style,
  order: number,
  encapsulationDepth: number = 1,
  layer: { normal: Layer<true>; important: Layer<true> } = implicitLayer,
): Block.JSON<Block.Source> {
  return ruleToBlockJSON(rule, order, encapsulationDepth, layer)[0];
}

const UA_MAX_RULES = [...UserAgent.descendants()].filter(
  Rule.isStyleRule,
).length;

/**
 * @internal
 */
export function authorOrder(order: number): number {
  return UA_MAX_RULES + order;
}
