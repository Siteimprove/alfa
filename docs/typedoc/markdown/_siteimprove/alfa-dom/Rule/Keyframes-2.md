[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Rule](../Rule.md) / Keyframes

# Class: Keyframes

Defined in: [alfa-dom/src/style/rule/keyframes.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts)

## Extends

- [`Grouping`](Grouping-1.md)\<`"keyframes"`\>

## Constructors

### Constructor

> `protected` **new Keyframes**(`name`, `rules`): `KeyframesRule`

Defined in: [alfa-dom/src/style/rule/keyframes.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts)

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

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

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

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

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

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

[`Grouping`](Grouping-1.md).[`_owner`](Grouping-1.md#_owner)

## _parent

### \_parent

> `protected` **\_parent**: `Option`\<[`Rule`](../Rule-1.md)\> = `None`

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

[`Grouping`](Grouping-1.md).[`_parent`](Grouping-1.md#_parent)

## _rules

### \_rules

> `protected` `readonly` **\_rules**: `Array`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

#### Inherited from

[`Grouping`](Grouping-1.md).[`_rules`](Grouping-1.md#_rules)

## ancestors

### ancestors()

> **ancestors**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

[`Grouping`](Grouping-1.md).[`ancestors`](Grouping-1.md#ancestors)

## children

### children()

> **children**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

[`Grouping`](Grouping-1.md).[`children`](Grouping-1.md#children)

## descendants

### descendants()

> **descendants**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

[`Grouping`](Grouping-1.md).[`descendants`](Grouping-1.md#descendants)

## equals

### equals()

> **equals**(`value`): `value is Keyframes`

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

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

Defined in: [alfa-dom/src/style/rule/keyframes.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts)

##### Returns

`string`

## of

### of()

> `static` **of**(`name`, `rules`): `KeyframesRule`

Defined in: [alfa-dom/src/style/rule/keyframes.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts)

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

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Sheet`](../Sheet-1.md)\>

#### Inherited from

[`Grouping`](Grouping-1.md).[`owner`](Grouping-1.md#owner)

## parent

### parent

#### Get Signature

> **get** **parent**(): `Option`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

[`Grouping`](Grouping-1.md).[`parent`](Grouping-1.md#parent)

## rules

### rules

#### Get Signature

> **get** **rules**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

##### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

[`Grouping`](Grouping-1.md).[`rules`](Grouping-1.md#rules)

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Keyframes/JSON.md)

Defined in: [alfa-dom/src/style/rule/keyframes.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts)

#### Returns

[`JSON`](Keyframes/JSON.md)

#### Overrides

[`Grouping`](Grouping-1.md).[`toJSON`](Grouping-1.md#tojson)

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/style/rule/keyframes.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts)

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

[`Grouping`](Grouping-1.md).[`type`](Grouping-1.md#type)
