[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Rule](../Rule.md) / Keyframes

# Class: Keyframes

Defined in: [alfa-dom/src/style/rule/keyframes.ts:11](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts#L11)

## Extends

- [`Grouping`](Grouping-1.md)\<`"keyframes"`\>

## Constructors

### Constructor

> `protected` **new Keyframes**(`name`, `rules`): `KeyframesRule`

Defined in: [alfa-dom/src/style/rule/keyframes.ts:18](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts#L18)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |
| `rules` | [`Rule`](../Rule-1.md)[] |

#### Returns

`KeyframesRule`

#### Overrides

[`Grouping`](Grouping-1.md).[`constructor`](Grouping-1.md#constructor)

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

[`Grouping`](Grouping-1.md).[`_attachOwner`](Grouping-1.md#_attachowner)

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

[`Grouping`](Grouping-1.md).[`_attachParent`](Grouping-1.md#_attachparent)

## _owner

### \_owner

> `protected` **\_owner**: `Option`\<[`Sheet`](../Sheet-1.md)\> = `None`

Defined in: [alfa-dom/src/style/rule/rule.ts:18](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L18)

#### Inherited from

[`Grouping`](Grouping-1.md).[`_owner`](Grouping-1.md#_owner)

## _parent

### \_parent

> `protected` **\_parent**: `Option`\<[`Rule`](../Rule-1.md)\> = `None`

Defined in: [alfa-dom/src/style/rule/rule.ts:19](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L19)

#### Inherited from

[`Grouping`](Grouping-1.md).[`_parent`](Grouping-1.md#_parent)

## _rules

### \_rules

> `protected` `readonly` **\_rules**: `Array`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/grouping.ts:12](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts#L12)

#### Inherited from

[`Grouping`](Grouping-1.md).[`_rules`](Grouping-1.md#_rules)

## ancestors

### ancestors()

> **ancestors**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:47](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L47)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

[`Grouping`](Grouping-1.md).[`ancestors`](Grouping-1.md#ancestors)

## children

### children()

> **children**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/grouping.ts:24](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts#L24)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

[`Grouping`](Grouping-1.md).[`children`](Grouping-1.md#children)

## descendants

### descendants()

> **descendants**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:40](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L40)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

[`Grouping`](Grouping-1.md).[`descendants`](Grouping-1.md#descendants)

## equals

### equals()

> **equals**(`value`): `value is Keyframes`

Defined in: [alfa-dom/src/style/rule/rule.ts:54](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L54)

Check if a value of the same type as this are equal.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

#### Returns

`value is Keyframes`

#### Remarks

This function does not further refine the type of the given value.

#### Inherited from

[`Grouping`](Grouping-1.md).[`equals`](Grouping-1.md#equals)

## name

### name

#### Get Signature

> **get** **name**(): `string`

Defined in: [alfa-dom/src/style/rule/keyframes.ts:24](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts#L24)

##### Returns

`string`

## of

### of()

> `static` **of**(`name`, `rules`): `KeyframesRule`

Defined in: [alfa-dom/src/style/rule/keyframes.ts:12](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts#L12)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |
| `rules` | `Iterable`\<[`Rule`](../Rule-1.md)\> |

#### Returns

`KeyframesRule`

## owner

### owner

#### Get Signature

> **get** **owner**(): `Option`\<[`Sheet`](../Sheet-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:30](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L30)

##### Returns

`Option`\<[`Sheet`](../Sheet-1.md)\>

#### Inherited from

[`Grouping`](Grouping-1.md).[`owner`](Grouping-1.md#owner)

## parent

### parent

#### Get Signature

> **get** **parent**(): `Option`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:34](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L34)

##### Returns

`Option`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

[`Grouping`](Grouping-1.md).[`parent`](Grouping-1.md#parent)

## rules

### rules

#### Get Signature

> **get** **rules**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/grouping.ts:20](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts#L20)

##### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

[`Grouping`](Grouping-1.md).[`rules`](Grouping-1.md#rules)

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Keyframes/JSON.md)

Defined in: [alfa-dom/src/style/rule/keyframes.ts:28](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts#L28)

#### Returns

[`JSON`](Keyframes/JSON.md)

#### Overrides

[`Grouping`](Grouping-1.md).[`toJSON`](Grouping-1.md#tojson)

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/style/rule/keyframes.ts:35](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts#L35)

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

[`Grouping`](Grouping-1.md).[`type`](Grouping-1.md#type)
