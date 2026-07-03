[**Alfa API documentation**](../../../../README.md)

***

[Alfa API documentation](../../../../README.md) / [@siteimprove/alfa-dom](../../../alfa-dom.md) / [Rule](../../Rule.md) / [Layer](../Layer.md) / Statement

# Class: Statement

Defined in: [alfa-dom/src/style/rule/layer.ts:28](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

[https://developer.mozilla.org/en-US/docs/Web/CSS/@layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
[https://drafts.csswg.org/css-cascade-5/#layer-empty](https://drafts.csswg.org/css-cascade-5/#layer-empty)
[https://developer.mozilla.org/en-US/docs/Web/API/CSSLayerStatementRule](https://developer.mozilla.org/en-US/docs/Web/API/CSSLayerStatementRule)

## Extends

- `BaseRule`\<`"layer-statement"`\>

## Constructors

### Constructor

> `protected` **new Statement**(`layers`): `StatementRule`

Defined in: [alfa-dom/src/style/rule/layer.ts:35](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `layers` | `Array`\<`string`\> |

#### Returns

`StatementRule`

#### Overrides

`BaseRule<"layer-statement">.constructor`

## _attachOwner

### \_attachOwner()

> **\_attachOwner**(`owner`): `boolean`

Defined in: [alfa-dom/src/style/rule/rule.ts:65](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

**`Internal`**

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `owner` | [`Sheet`](../../Sheet-1.md) |

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
| `parent` | [`Rule`](../../Rule-1.md) |

#### Returns

`boolean`

#### Inherited from

`BaseRule._attachParent`

## _owner

### \_owner

> `protected` **\_owner**: `Option`\<[`Sheet`](../../Sheet-1.md)\> = `None`

Defined in: [alfa-dom/src/style/rule/rule.ts:18](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

`BaseRule._owner`

## _parent

### \_parent

> `protected` **\_parent**: `Option`\<[`Rule`](../../Rule-1.md)\> = `None`

Defined in: [alfa-dom/src/style/rule/rule.ts:19](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

`BaseRule._parent`

## ancestors

### ancestors()

> **ancestors**(): `Iterable`\<[`Rule`](../../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:47](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

`BaseRule.ancestors`

## children

### children()

> **children**(): `Iterable`\<[`Rule`](../../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:38](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

`BaseRule.children`

## descendants

### descendants()

> **descendants**(): `Iterable`\<[`Rule`](../../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:40](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

`BaseRule.descendants`

## equals

### equals()

> **equals**(`value`): `value is Statement`

Defined in: [alfa-dom/src/style/rule/rule.ts:54](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

Check if a value of the same type as this are equal.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

#### Returns

`value is Statement`

#### Remarks

This function does not further refine the type of the given value.

#### Inherited from

`BaseRule.equals`

## layers

### layers

#### Get Signature

> **get** **layers**(): `Iterable`\<`string`\>

Defined in: [alfa-dom/src/style/rule/layer.ts:40](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

##### Returns

`Iterable`\<`string`\>

## of

### of()

> `static` **of**(`layers`): `StatementRule`

Defined in: [alfa-dom/src/style/rule/layer.ts:29](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `layers` | `Iterable`\<`string`\> |

#### Returns

`StatementRule`

## owner

### owner

#### Get Signature

> **get** **owner**(): `Option`\<[`Sheet`](../../Sheet-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:30](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Sheet`](../../Sheet-1.md)\>

#### Inherited from

`BaseRule.owner`

## parent

### parent

#### Get Signature

> **get** **parent**(): `Option`\<[`Rule`](../../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts:34](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

`BaseRule.parent`

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Statement/JSON.md)

Defined in: [alfa-dom/src/style/rule/layer.ts:44](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

#### Returns

[`JSON`](Statement/JSON.md)

#### Overrides

`BaseRule.toJSON`

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/style/rule/layer.ts:51](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

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
