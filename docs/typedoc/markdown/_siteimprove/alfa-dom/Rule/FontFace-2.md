[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Rule](../Rule.md) / FontFace

# Class: FontFace

Defined in: [alfa-dom/src/style/rule/font-face.ts:11](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/font-face.ts)

## Extends

- `BaseRule`\<`"font-face"`\>

## Constructors

### Constructor

> `protected` **new FontFace**(`declarations`): `FontFaceRule`

Defined in: [alfa-dom/src/style/rule/font-face.ts:18](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/font-face.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `declarations` | [`Declaration`](../Declaration-1.md)[] |

#### Returns

`FontFaceRule`

#### Overrides

`BaseRule<"font-face">.constructor`

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

> **equals**(`value`): `value is FontFace`

Defined in: [alfa-dom/src/style/rule/rule.ts:54](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

Check if a value of the same type as this are equal.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

#### Returns

`value is FontFace`

#### Remarks

This function does not further refine the type of the given value.

#### Inherited from

`BaseRule.equals`

## of

### of()

> `static` **of**(`declarations`): `FontFaceRule`

Defined in: [alfa-dom/src/style/rule/font-face.ts:12](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/font-face.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `declarations` | `Iterable`\<[`Declaration`](../Declaration-1.md)\> |

#### Returns

`FontFaceRule`

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

## style

### style

#### Get Signature

> **get** **style**(): [`Block`](../Block-1.md)

Defined in: [alfa-dom/src/style/rule/font-face.ts:26](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/font-face.ts)

##### Returns

[`Block`](../Block-1.md)

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](FontFace/JSON.md)

Defined in: [alfa-dom/src/style/rule/font-face.ts:30](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/font-face.ts)

#### Returns

[`JSON`](FontFace/JSON.md)

#### Overrides

`BaseRule.toJSON`

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/style/rule/font-face.ts:37](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/font-face.ts)

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
