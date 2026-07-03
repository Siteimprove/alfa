[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-act](../../alfa-act.md) / [Outcome](../Outcome.md) / JSON

# Interface: JSON\<V\>

Defined in: [alfa-act/src/outcome.ts:171](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L171)

## Extended by

- [`JSON`](Passed/JSON.md)
- [`JSON`](Failed/JSON.md)
- [`JSON`](CantTell/JSON.md)
- [`JSON`](Inapplicable/JSON.md)

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `V` *extends* [`Value`](Value.md) | [`Value`](Value.md) |

## Indexable

> \[`key`: `string`\]: `JSON`

## mode

### mode

> **mode**: [`Mode`](Mode.md)

Defined in: [alfa-act/src/outcome.ts:175](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L175)

## outcome

### outcome

> **outcome**: `V`

Defined in: [alfa-act/src/outcome.ts:173](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L173)

## rule

### rule

> **rule**: [`JSON`](../Rule/JSON.md) \| [`MinimalJSON`](../Rule/MinimalJSON.md)

Defined in: [alfa-act/src/outcome.ts:174](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L174)
