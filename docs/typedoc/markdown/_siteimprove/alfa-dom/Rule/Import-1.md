[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Rule](../Rule.md) / Import

# Class: Import

Defined in: [alfa-dom/src/style/rule/import.ts:18](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts#L18)

## Extends

- `ConditionRule`\<`"import"`\>

## Constructors

### Constructor

> `protected` **new Import**(`href`, `sheet`, `mediaCondition`, `supportCondition`, `layer`): `ImportRule`

Defined in: [alfa-dom/src/style/rule/import.ts:40](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts#L40)

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

Defined in: [alfa-dom/src/style/rule/rule.ts:65](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L65)

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

Defined in: [alfa-dom/src/style/rule/rule.ts:79](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L79)

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

Defined in: [alfa-dom/src/style/rule/condition.ts:10](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/condition.ts#L10)

#### Inherited from

`ConditionRule._condition`

## _owner

### \_owner

> `protected` **\_owner**: `Option`\<[`Sheet`](../Sheet-1.md)\> = `None`

Defined in: [alfa-dom/src/style/rule/rule.ts:18](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L18)

#### Inherited from

`ConditionRule._owner`

## _parent

### \_parent

> `protected` **\_parent**: `Option`\<[`Rule`](../Rule-1.md)\> = `None`

Defined in: [alfa-dom/src/style/rule/rule.ts:19](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L19)

#### Inherited from

`ConditionRule._parent`

## _rules

### \_rules

> `protected` `readonly` **\_rules**: `Array`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/grouping.ts:12](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts#L12)

#### Inherited from

`ConditionRule._rules`

## ancestors

### ancestors()

> **ancestors**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:47](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L47)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`ConditionRule.ancestors`

## children

### children()

> **children**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/grouping.ts:24](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts#L24)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`ConditionRule.children`

## condition

### condition

#### Get Signature

> **get** **condition**(): `string`

Defined in: [alfa-dom/src/style/rule/condition.ts:18](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/condition.ts#L18)

##### Returns

`string`

#### Inherited from

`ConditionRule.condition`

## descendants

### descendants()

> **descendants**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:40](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L40)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`ConditionRule.descendants`

## equals

### equals()

> **equals**(`value`): `value is Import`

Defined in: [alfa-dom/src/style/rule/rule.ts:54](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L54)

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

Defined in: [alfa-dom/src/style/rule/import.ts:94](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts#L94)

##### Returns

`string`

## layer

### layer

#### Get Signature

> **get** **layer**(): `Option`\<`string`\>

Defined in: [alfa-dom/src/style/rule/import.ts:86](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts#L86)

##### Returns

`Option`\<`string`\>

## mediaQueries

### mediaQueries

#### Get Signature

> **get** **mediaQueries**(): `List`

Defined in: [alfa-dom/src/style/rule/import.ts:78](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts#L78)

##### Returns

`List`

## of

### of()

> `static` **of**(`href`, `sheet`, `mediaCondition?`, `supportCondition?`, `layer?`): `ImportRule`

Defined in: [alfa-dom/src/style/rule/import.ts:19](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts#L19)

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

Defined in: [alfa-dom/src/style/rule/rule.ts:30](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L30)

##### Returns

`Option`\<[`Sheet`](../Sheet-1.md)\>

#### Inherited from

`ConditionRule.owner`

## parent

### parent

#### Get Signature

> **get** **parent**(): `Option`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:34](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L34)

##### Returns

`Option`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`ConditionRule.parent`

## rules

### rules

#### Get Signature

> **get** **rules**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/import.ts:90](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts#L90)

##### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Overrides

`ConditionRule.rules`

## sheet

### sheet

#### Get Signature

> **get** **sheet**(): [`Sheet`](../Sheet-1.md)

Defined in: [alfa-dom/src/style/rule/import.ts:98](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts#L98)

##### Returns

[`Sheet`](../Sheet-1.md)

## supportCondition

### supportCondition

#### Get Signature

> **get** **supportCondition**(): `Option`\<`string`\>

Defined in: [alfa-dom/src/style/rule/import.ts:74](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts#L74)

##### Returns

`Option`\<`string`\>

## supportQuery

### supportQuery

#### Get Signature

> **get** **supportQuery**(): `Option`\<`Option`\<`Query`\>\>

Defined in: [alfa-dom/src/style/rule/import.ts:82](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts#L82)

##### Returns

`Option`\<`Option`\<`Query`\>\>

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Import/JSON.md)

Defined in: [alfa-dom/src/style/rule/import.ts:102](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts#L102)

#### Returns

[`JSON`](Import/JSON.md)

#### Overrides

`ConditionRule.toJSON`

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/style/rule/import.ts:116](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts#L116)

Returns a string representation of an object.

#### Returns

`string`

## type

### type

#### Get Signature

> **get** **type**(): `T`

Defined in: [alfa-dom/src/style/rule/rule.ts:26](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L26)

##### Returns

`T`

#### Inherited from

`ConditionRule.type`
