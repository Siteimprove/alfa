[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Rule](../Rule.md) / Keyframe

# Class: Keyframe

Defined in: [alfa-dom/src/style/rule/keyframe.ts:11](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframe.ts)

## Extends

- `BaseRule`\<`"keyframe"`\>

## Constructors

### Constructor

> `protected` **new Keyframe**(`key`, `declarations`): `KeyframeRule`

Defined in: [alfa-dom/src/style/rule/keyframe.ts:22](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframe.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `string` |
| `declarations` | [`Declaration`](../Declaration-1.md)[] |

#### Returns

`KeyframeRule`

#### Overrides

`BaseRule<"keyframe">.constructor`

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

> **equals**(`value`): `value is Keyframe`

Defined in: [alfa-dom/src/style/rule/rule.ts:54](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

Check if a value of the same type as this are equal.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

#### Returns

`value is Keyframe`

#### Remarks

This function does not further refine the type of the given value.

#### Inherited from

`BaseRule.equals`

## key

### key

#### Get Signature

> **get** **key**(): `string`

Defined in: [alfa-dom/src/style/rule/keyframe.ts:31](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframe.ts)

##### Returns

`string`

## of

### of()

> `static` **of**(`key`, `declarations`): `KeyframeRule`

Defined in: [alfa-dom/src/style/rule/keyframe.ts:12](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframe.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `string` |
| `declarations` | `Iterable`\<[`Declaration`](../Declaration-1.md)\> |

#### Returns

`KeyframeRule`

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

Defined in: [alfa-dom/src/style/rule/keyframe.ts:35](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframe.ts)

##### Returns

[`Block`](../Block-1.md)

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Keyframe/JSON.md)

Defined in: [alfa-dom/src/style/rule/keyframe.ts:39](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframe.ts)

#### Returns

[`JSON`](Keyframe/JSON.md)

#### Overrides

`BaseRule.toJSON`

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/style/rule/keyframe.ts:47](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframe.ts)

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
