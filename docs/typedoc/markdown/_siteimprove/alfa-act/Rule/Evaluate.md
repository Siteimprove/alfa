[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-act](../../alfa-act.md) / [Rule](../Rule.md) / Evaluate

# Interface: Evaluate()\<I, T, Q, S\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Remarks

We use a short-lived cache during audits for rules to store their outcomes.
It effectively acts as a memoization layer on top of each rule evaluation
procedure, which comes in handy when dealing with composite rules that are
dependant on the outcomes of other rules. There are several ways in which
audits of such rules can be performed:

1. Put the onus on the caller to construct an audit with dependency-ordered
   rules. This is just crazy.

2. Topologically sort rules based on their dependencies before performing
   an audit. This requires graph operations.

3. Disregard order entirely and simply run rule evaluation procedures as
   their outcomes are needed, thereby risking repeating some of these
   procedures. This requires nothing.

Given that 3. is the simpler, and non-crazy, approach, we can use this
approach in combination with memoization to avoid the risk of repeating
rule evaluation procedures.

## Type Parameters

| Type Parameter |
| ------ |
| `I` |
| `T` *extends* `Hashable` |
| `Q` *extends* [`Metadata`](../Question/Metadata.md) |
| `S` |

> **Evaluate**(`input`, `oracle`, `outcomes`, `performance?`): `Promise`\<`Iterable`\<[`Outcome`](../Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Value`](../Outcome/Value.md)\>\>\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `Readonly`\<`I`\> |
| `oracle` | `object` *extends* `Q` ? `any` : [`Oracle`](../Oracle.md)\<`I`, `T`, `Q`, `S`\> |
| `outcomes` | [`Cache`](../Cache.md) |
| `performance?` | `Performance`\<[`Event`](Event-1.md)\<`I`, `T`, `Q`, `S`, [`Type`](Event/Type.md), `string`\>\> |

## Returns

`Promise`\<`Iterable`\<[`Outcome`](../Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Value`](../Outcome/Value.md)\>\>\>

## Remarks

We use a short-lived cache during audits for rules to store their outcomes.
It effectively acts as a memoization layer on top of each rule evaluation
procedure, which comes in handy when dealing with composite rules that are
dependant on the outcomes of other rules. There are several ways in which
audits of such rules can be performed:

1. Put the onus on the caller to construct an audit with dependency-ordered
   rules. This is just crazy.

2. Topologically sort rules based on their dependencies before performing
   an audit. This requires graph operations.

3. Disregard order entirely and simply run rule evaluation procedures as
   their outcomes are needed, thereby risking repeating some of these
   procedures. This requires nothing.

Given that 3. is the simpler, and non-crazy, approach, we can use this
approach in combination with memoization to avoid the risk of repeating
rule evaluation procedures.
