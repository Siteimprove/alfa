[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Rule](../Rule.md) / Style

# Class: Style

Defined in: [alfa-dom/src/style/rule/style.ts:11](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/style.ts)

## Extends

- `BaseRule`\<`"style"`\>

## Constructors

### Constructor

> `protected` **new Style**(`selector`, `declarations`, `hint`): `StyleRule`

Defined in: [alfa-dom/src/style/rule/style.ts:24](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/style.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `selector` | `string` |
| `declarations` | [`Declaration`](../Declaration-1.md)[] |
| `hint` | `boolean` |

#### Returns

`StyleRule`

#### Overrides

`BaseRule<"style">.constructor`

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

`BaseRule._attachOwner`

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

`BaseRule._attachParent`

## _owner

### \_owner

> `protected` **\_owner**: `Option`\<[`Sheet`](../Sheet-1.md)\> = `None`

Defined in: [alfa-dom/src/style/rule/rule.ts:18](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

`BaseRule._owner`

## _parent

### \_parent

> `protected` **\_parent**: `Option`\<[`Rule`](../Rule-1.md)\> = `None`

Defined in: [alfa-dom/src/style/rule/rule.ts:19](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

`BaseRule._parent`

## ancestors

### ancestors()

> **ancestors**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:47](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`BaseRule.ancestors`

## children

### children()

> **children**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:38](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`BaseRule.children`

## descendants

### descendants()

> **descendants**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:40](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`BaseRule.descendants`

## equals

### equals()

> **equals**(`value`): `value is Style`

Defined in: [alfa-dom/src/style/rule/rule.ts:54](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

Check if a value of the same type as this are equal.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

#### Returns

`value is Style`

#### Remarks

This function does not further refine the type of the given value.

#### Inherited from

`BaseRule.equals`

## hint

### hint

#### Get Signature

> **get** **hint**(): `boolean`

Defined in: [alfa-dom/src/style/rule/style.ts:46](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/style.ts)

##### Returns

`boolean`

## of

### of()

> `static` **of**(`selector`, `declarations`, `hint?`): `StyleRule`

Defined in: [alfa-dom/src/style/rule/style.ts:12](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/style.ts)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `selector` | `string` | `undefined` |
| `declarations` | `Iterable`\<[`Declaration`](../Declaration-1.md)\> | `undefined` |
| `hint` | `boolean` | `false` |

#### Returns

`StyleRule`

## owner

### owner

#### Get Signature

> **get** **owner**(): `Option`\<[`Sheet`](../Sheet-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:30](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Sheet`](../Sheet-1.md)\>

#### Inherited from

`BaseRule.owner`

## parent

### parent

#### Get Signature

> **get** **parent**(): `Option`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:34](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`BaseRule.parent`

## selector

### selector

#### Get Signature

> **get** **selector**(): `string`

Defined in: [alfa-dom/src/style/rule/style.ts:38](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/style.ts)

##### Returns

`string`

## style

### style

#### Get Signature

> **get** **style**(): [`Block`](../Block-1.md)

Defined in: [alfa-dom/src/style/rule/style.ts:42](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/style.ts)

##### Returns

[`Block`](../Block-1.md)

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Style/JSON.md)

Defined in: [alfa-dom/src/style/rule/style.ts:50](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/style.ts)

#### Returns

[`JSON`](Style/JSON.md)

#### Overrides

`BaseRule.toJSON`

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/style/rule/style.ts:58](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/style.ts)

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

`BaseRule.type`
