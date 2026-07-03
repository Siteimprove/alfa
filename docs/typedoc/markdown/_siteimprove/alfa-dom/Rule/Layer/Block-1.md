[**Alfa API documentation**](../../../../README.md)

***

[Alfa API documentation](../../../../README.md) / [@siteimprove/alfa-dom](../../../alfa-dom.md) / [Rule](../../Rule.md) / [Layer](../Layer.md) / Block

# Class: Block

Defined in: [alfa-dom/src/style/rule/layer.ts:79](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts#L79)

[https://developer.mozilla.org/en-US/docs/Web/CSS/@layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
[https://drafts.csswg.org/css-cascade-5/#layer-block](https://drafts.csswg.org/css-cascade-5/#layer-block)
[https://developer.mozilla.org/en-US/docs/Web/API/CSSLayerBlockRule](https://developer.mozilla.org/en-US/docs/Web/API/CSSLayerBlockRule)

## Extends

- [`Grouping`](../Grouping-1.md)\<`"layer-block"`\>

## Constructors

### Constructor

> `protected` **new Block**(`layer`, `rules`): `BlockRule`

Defined in: [alfa-dom/src/style/rule/layer.ts:86](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts#L86)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `layer` | `Option`\<`string`\> |
| `rules` | `Array`\<[`Rule`](../../Rule-1.md)\> |

#### Returns

`BlockRule`

#### Overrides

[`Grouping`](../Grouping-1.md).[`constructor`](../Grouping-1.md#constructor)

## _attachOwner

### \_attachOwner()

> **\_attachOwner**(`owner`): `boolean`

Defined in: [alfa-dom/src/style/rule/rule.ts:65](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L65)

**`Internal`**

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `owner` | [`Sheet`](../../Sheet-1.md) |

#### Returns

`boolean`

#### Inherited from

[`Grouping`](../Grouping-1.md).[`_attachOwner`](../Grouping-1.md#_attachowner)

## _attachParent

### \_attachParent()

> **\_attachParent**(`parent`): `boolean`

Defined in: [alfa-dom/src/style/rule/rule.ts:79](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L79)

**`Internal`**

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `parent` | [`Rule`](../../Rule-1.md) |

#### Returns

`boolean`

#### Inherited from

[`Grouping`](../Grouping-1.md).[`_attachParent`](../Grouping-1.md#_attachparent)

## _owner

### \_owner

> `protected` **\_owner**: `Option`\<[`Sheet`](../../Sheet-1.md)\> = `None`

Defined in: [alfa-dom/src/style/rule/rule.ts:18](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L18)

#### Inherited from

[`Grouping`](../Grouping-1.md).[`_owner`](../Grouping-1.md#_owner)

## _parent

### \_parent

> `protected` **\_parent**: `Option`\<[`Rule`](../../Rule-1.md)\> = `None`

Defined in: [alfa-dom/src/style/rule/rule.ts:19](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L19)

#### Inherited from

[`Grouping`](../Grouping-1.md).[`_parent`](../Grouping-1.md#_parent)

## _rules

### \_rules

> `protected` `readonly` **\_rules**: `Array`\<[`Rule`](../../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/grouping.ts:12](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts#L12)

#### Inherited from

[`Grouping`](../Grouping-1.md).[`_rules`](../Grouping-1.md#_rules)

## ancestors

### ancestors()

> **ancestors**(): `Iterable`\<[`Rule`](../../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:47](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L47)

#### Returns

`Iterable`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

[`Grouping`](../Grouping-1.md).[`ancestors`](../Grouping-1.md#ancestors)

## children

### children()

> **children**(): `Iterable`\<[`Rule`](../../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/grouping.ts:24](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts#L24)

#### Returns

`Iterable`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

[`Grouping`](../Grouping-1.md).[`children`](../Grouping-1.md#children)

## descendants

### descendants()

> **descendants**(): `Iterable`\<[`Rule`](../../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:40](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L40)

#### Returns

`Iterable`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

[`Grouping`](../Grouping-1.md).[`descendants`](../Grouping-1.md#descendants)

## equals

### equals()

> **equals**(`value`): `value is Block`

Defined in: [alfa-dom/src/style/rule/layer.ts:95](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts#L95)

Check if a value of the same type as this are equal.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

#### Returns

`value is Block`

#### Remarks

This function does not further refine the type of the given value.

#### Overrides

[`Grouping`](../Grouping-1.md).[`equals`](../Grouping-1.md#equals)

## layer

### layer

#### Get Signature

> **get** **layer**(): `Option`\<`string`\>

Defined in: [alfa-dom/src/style/rule/layer.ts:91](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts#L91)

##### Returns

`Option`\<`string`\>

## of

### of()

> `static` **of**(`rules`, `layer?`): `BlockRule`

Defined in: [alfa-dom/src/style/rule/layer.ts:80](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts#L80)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `rules` | `Iterable`\<[`Rule`](../../Rule-1.md)\> |
| `layer?` | `string` \| `null` |

#### Returns

`BlockRule`

## owner

### owner

#### Get Signature

> **get** **owner**(): `Option`\<[`Sheet`](../../Sheet-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:30](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L30)

##### Returns

`Option`\<[`Sheet`](../../Sheet-1.md)\>

#### Inherited from

[`Grouping`](../Grouping-1.md).[`owner`](../Grouping-1.md#owner)

## parent

### parent

#### Get Signature

> **get** **parent**(): `Option`\<[`Rule`](../../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:34](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts#L34)

##### Returns

`Option`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

[`Grouping`](../Grouping-1.md).[`parent`](../Grouping-1.md#parent)

## rules

### rules

#### Get Signature

> **get** **rules**(): `Iterable`\<[`Rule`](../../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/grouping.ts:20](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts#L20)

##### Returns

`Iterable`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

[`Grouping`](../Grouping-1.md).[`rules`](../Grouping-1.md#rules)

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Block/JSON.md)

Defined in: [alfa-dom/src/style/rule/layer.ts:103](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts#L103)

#### Returns

[`JSON`](Block/JSON.md)

#### Overrides

[`Grouping`](../Grouping-1.md).[`toJSON`](../Grouping-1.md#tojson)

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/style/rule/layer.ts:110](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts#L110)

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

[`Grouping`](../Grouping-1.md).[`type`](../Grouping-1.md#type)
