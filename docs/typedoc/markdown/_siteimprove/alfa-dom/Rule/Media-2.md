[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Rule](../Rule.md) / Media

# Class: Media

Defined in: [alfa-dom/src/style/rule/media.ts:15](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/media.ts)

## Extends

- `ConditionRule`\<`"media"`\>

## Constructors

### Constructor

> `protected` **new Media**(`condition`, `rules`): `MediaRule`

Defined in: [alfa-dom/src/style/rule/media.ts:22](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/media.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `condition` | `string` |
| `rules` | [`Rule`](../Rule-1.md)[] |

#### Returns

`MediaRule`

#### Overrides

`ConditionRule<"media">.constructor`

## _attachOwner

### \_attachOwner()

> **\_attachOwner**(`owner`): `boolean`

Defined in: [alfa-dom/src/style/rule/rule.ts:65](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

**`Internal`**

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `owner` | [`Sheet`](../Sheet-1.md) |

#### Returns

`boolean`

#### Inherited from

`ConditionRule._attachOwner`

## _attachParent

### \_attachParent()

> **\_attachParent**(`parent`): `boolean`

Defined in: [alfa-dom/src/style/rule/rule.ts:79](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

**`Internal`**

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `parent` | [`Rule`](../Rule-1.md) |

#### Returns

`boolean`

#### Inherited from

`ConditionRule._attachParent`

## _condition

### \_condition

> `protected` `readonly` **\_condition**: `string`

Defined in: [alfa-dom/src/style/rule/condition.ts:10](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/condition.ts)

#### Inherited from

`ConditionRule._condition`

## _owner

### \_owner

> `protected` **\_owner**: `Option`\<[`Sheet`](../Sheet-1.md)\> = `None`

Defined in: [alfa-dom/src/style/rule/rule.ts:18](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

`ConditionRule._owner`

## _parent

### \_parent

> `protected` **\_parent**: `Option`\<[`Rule`](../Rule-1.md)\> = `None`

Defined in: [alfa-dom/src/style/rule/rule.ts:19](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

`ConditionRule._parent`

## _rules

### \_rules

> `protected` `readonly` **\_rules**: `Array`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/grouping.ts:12](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

#### Inherited from

`ConditionRule._rules`

## ancestors

### ancestors()

> **ancestors**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:47](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`ConditionRule.ancestors`

## children

### children()

> **children**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/grouping.ts:24](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`ConditionRule.children`

## condition

### condition

#### Get Signature

> **get** **condition**(): `string`

Defined in: [alfa-dom/src/style/rule/condition.ts:18](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/condition.ts)

##### Returns

`string`

#### Inherited from

`ConditionRule.condition`

## descendants

### descendants()

> **descendants**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:40](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`ConditionRule.descendants`

## equals

### equals()

> **equals**(`value`): `value is Media`

Defined in: [alfa-dom/src/style/rule/rule.ts:54](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

Check if a value of the same type as this are equal.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

#### Returns

`value is Media`

#### Remarks

This function does not further refine the type of the given value.

#### Inherited from

`ConditionRule.equals`

## of

### of()

> `static` **of**(`condition`, `rules`): `MediaRule`

Defined in: [alfa-dom/src/style/rule/media.ts:16](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/media.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `condition` | `string` |
| `rules` | `Iterable`\<[`Rule`](../Rule-1.md)\> |

#### Returns

`MediaRule`

## owner

### owner

#### Get Signature

> **get** **owner**(): `Option`\<[`Sheet`](../Sheet-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:30](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Sheet`](../Sheet-1.md)\>

#### Inherited from

`ConditionRule.owner`

## parent

### parent

#### Get Signature

> **get** **parent**(): `Option`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:34](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`ConditionRule.parent`

## queries

### queries

#### Get Signature

> **get** **queries**(): `List`

Defined in: [alfa-dom/src/style/rule/media.ts:30](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/media.ts)

##### Returns

`List`

## rules

### rules

#### Get Signature

> **get** **rules**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/grouping.ts:20](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

##### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`ConditionRule.rules`

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Media/JSON.md)

Defined in: [alfa-dom/src/style/rule/media.ts:34](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/media.ts)

#### Returns

[`JSON`](Media/JSON.md)

#### Overrides

`ConditionRule.toJSON`

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/style/rule/media.ts:38](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/media.ts)

Returns a string representation of an object.

#### Returns

`string`

## type

### type

#### Get Signature

> **get** **type**(): `T`

Defined in: [alfa-dom/src/style/rule/rule.ts:26](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`T`

#### Inherited from

`ConditionRule.type`
