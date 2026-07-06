[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Rule](../Rule.md) / Supports

# Class: Supports

Defined in: [alfa-dom/src/style/rule/supports.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/supports.ts)

## Extends

- `ConditionRule`\<`"supports"`\>

## Constructors

### Constructor

> `protected` **new Supports**(`condition`, `rules`): `SupportsRule`

Defined in: [alfa-dom/src/style/rule/supports.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/supports.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `condition` | `string` |
| `rules` | [`Rule`](../Rule-1.md)[] |

#### Returns

`SupportsRule`

#### Overrides

`ConditionRule<"supports">.constructor`

## _attachOwner

### \_attachOwner()

> **\_attachOwner**(`owner`): `boolean`

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

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

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

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

Defined in: [alfa-dom/src/style/rule/condition.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/condition.ts)

#### Inherited from

`ConditionRule._condition`

## _owner

### \_owner

> `protected` **\_owner**: `Option`\<[`Sheet`](../Sheet-1.md)\> = `None`

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

`ConditionRule._owner`

## _parent

### \_parent

> `protected` **\_parent**: `Option`\<[`Rule`](../Rule-1.md)\> = `None`

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

`ConditionRule._parent`

## _rules

### \_rules

> `protected` `readonly` **\_rules**: `Array`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

#### Inherited from

`ConditionRule._rules`

## ancestors

### ancestors()

> **ancestors**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`ConditionRule.ancestors`

## children

### children()

> **children**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`ConditionRule.children`

## condition

### condition

#### Get Signature

> **get** **condition**(): `string`

Defined in: [alfa-dom/src/style/rule/condition.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/condition.ts)

##### Returns

`string`

#### Inherited from

`ConditionRule.condition`

## descendants

### descendants()

> **descendants**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`ConditionRule.descendants`

## equals

### equals()

> **equals**(`value`): `value is Supports`

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

Check if a value of the same type as this are equal.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

#### Returns

`value is Supports`

#### Remarks

This function does not further refine the type of the given value.

#### Inherited from

`ConditionRule.equals`

## of

### of()

> `static` **of**(`condition`, `rules`): `SupportsRule`

Defined in: [alfa-dom/src/style/rule/supports.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/supports.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `condition` | `string` |
| `rules` | `Iterable`\<[`Rule`](../Rule-1.md)\> |

#### Returns

`SupportsRule`

## owner

### owner

#### Get Signature

> **get** **owner**(): `Option`\<[`Sheet`](../Sheet-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Sheet`](../Sheet-1.md)\>

#### Inherited from

`ConditionRule.owner`

## parent

### parent

#### Get Signature

> **get** **parent**(): `Option`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`ConditionRule.parent`

## query

### query

#### Get Signature

> **get** **query**(): `Option`\<`Query`\>

Defined in: [alfa-dom/src/style/rule/supports.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/supports.ts)

##### Returns

`Option`\<`Query`\>

## rules

### rules

#### Get Signature

> **get** **rules**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

##### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`ConditionRule.rules`

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Supports/JSON.md)

Defined in: [alfa-dom/src/style/rule/supports.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/supports.ts)

#### Returns

[`JSON`](Supports/JSON.md)

#### Overrides

`ConditionRule.toJSON`

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/style/rule/supports.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/supports.ts)

Returns a string representation of an object.

#### Returns

`string`

## type

### type

#### Get Signature

> **get** **type**(): `T`

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`T`

#### Inherited from

`ConditionRule.type`
