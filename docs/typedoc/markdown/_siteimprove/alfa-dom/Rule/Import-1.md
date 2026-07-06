[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Rule](../Rule.md) / Import

# Class: Import

Defined in: [alfa-dom/src/style/rule/import.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts)

## Extends

- `ConditionRule`\<`"import"`\>

## Constructors

### Constructor

> `protected` **new Import**(`href`, `sheet`, `mediaCondition`, `supportCondition`, `layer`): `ImportRule`

Defined in: [alfa-dom/src/style/rule/import.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `href` | `string` |
| `sheet` | [`Sheet`](../Sheet-1.md) |
| `mediaCondition` | `Option`\<`string`\> |
| `supportCondition` | `Option`\<`string`\> |
| `layer` | `Option`\<`string`\> |

#### Returns

`ImportRule`

#### Overrides

`ConditionRule<"import">.constructor`

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

> **equals**(`value`): `value is Import`

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

Check if a value of the same type as this are equal.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

#### Returns

`value is Import`

#### Remarks

This function does not further refine the type of the given value.

#### Inherited from

`ConditionRule.equals`

## href

### href

#### Get Signature

> **get** **href**(): `string`

Defined in: [alfa-dom/src/style/rule/import.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts)

##### Returns

`string`

## layer

### layer

#### Get Signature

> **get** **layer**(): `Option`\<`string`\>

Defined in: [alfa-dom/src/style/rule/import.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts)

##### Returns

`Option`\<`string`\>

## mediaQueries

### mediaQueries

#### Get Signature

> **get** **mediaQueries**(): `List`

Defined in: [alfa-dom/src/style/rule/import.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts)

##### Returns

`List`

## of

### of()

> `static` **of**(`href`, `sheet`, `mediaCondition?`, `supportCondition?`, `layer?`): `ImportRule`

Defined in: [alfa-dom/src/style/rule/import.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `href` | `string` | `undefined` |
| `sheet` | [`Sheet`](../Sheet-1.md) | `undefined` |
| `mediaCondition` | `Option`\<`string`\> | `None` |
| `supportCondition` | `Option`\<`string`\> | `None` |
| `layer` | `Option`\<`string`\> | `None` |

#### Returns

`ImportRule`

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

## rules

### rules

#### Get Signature

> **get** **rules**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/import.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts)

##### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Overrides

`ConditionRule.rules`

## sheet

### sheet

#### Get Signature

> **get** **sheet**(): [`Sheet`](../Sheet-1.md)

Defined in: [alfa-dom/src/style/rule/import.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts)

##### Returns

[`Sheet`](../Sheet-1.md)

## supportCondition

### supportCondition

#### Get Signature

> **get** **supportCondition**(): `Option`\<`string`\>

Defined in: [alfa-dom/src/style/rule/import.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts)

##### Returns

`Option`\<`string`\>

## supportQuery

### supportQuery

#### Get Signature

> **get** **supportQuery**(): `Option`\<`Option`\<`Query`\>\>

Defined in: [alfa-dom/src/style/rule/import.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts)

##### Returns

`Option`\<`Option`\<`Query`\>\>

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Import/JSON.md)

Defined in: [alfa-dom/src/style/rule/import.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts)

#### Returns

[`JSON`](Import/JSON.md)

#### Overrides

`ConditionRule.toJSON`

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/style/rule/import.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts)

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
