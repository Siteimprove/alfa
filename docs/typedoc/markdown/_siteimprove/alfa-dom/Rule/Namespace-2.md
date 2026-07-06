[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Rule](../Rule.md) / Namespace

# Class: Namespace

Defined in: [alfa-dom/src/style/rule/namespace.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/namespace.ts)

## Extends

- `BaseRule`\<`"namespace"`\>

## Constructors

### Constructor

> `protected` **new Namespace**(`namespace`, `prefix`): `NamespaceRule`

Defined in: [alfa-dom/src/style/rule/namespace.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/namespace.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `namespace` | `string` |
| `prefix` | `Option`\<`string`\> |

#### Returns

`NamespaceRule`

#### Overrides

`BaseRule<"namespace">.constructor`

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

`BaseRule._attachOwner`

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

`BaseRule._attachParent`

## _owner

### \_owner

> `protected` **\_owner**: `Option`\<[`Sheet`](../Sheet-1.md)\> = `None`

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

`BaseRule._owner`

## _parent

### \_parent

> `protected` **\_parent**: `Option`\<[`Rule`](../Rule-1.md)\> = `None`

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

`BaseRule._parent`

## ancestors

### ancestors()

> **ancestors**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`BaseRule.ancestors`

## children

### children()

> **children**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`BaseRule.children`

## descendants

### descendants()

> **descendants**(): `Iterable`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`BaseRule.descendants`

## equals

### equals()

> **equals**(`value`): `value is Namespace`

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

Check if a value of the same type as this are equal.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

#### Returns

`value is Namespace`

#### Remarks

This function does not further refine the type of the given value.

#### Inherited from

`BaseRule.equals`

## namespace

### namespace

#### Get Signature

> **get** **namespace**(): `string`

Defined in: [alfa-dom/src/style/rule/namespace.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/namespace.ts)

##### Returns

`string`

## of

### of()

> `static` **of**(`namespace`, `prefix`): `NamespaceRule`

Defined in: [alfa-dom/src/style/rule/namespace.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/namespace.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `namespace` | `string` |
| `prefix` | `Option`\<`string`\> |

#### Returns

`NamespaceRule`

## owner

### owner

#### Get Signature

> **get** **owner**(): `Option`\<[`Sheet`](../Sheet-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Sheet`](../Sheet-1.md)\>

#### Inherited from

`BaseRule.owner`

## parent

### parent

#### Get Signature

> **get** **parent**(): `Option`\<[`Rule`](../Rule-1.md)\>

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

`BaseRule.parent`

## prefix

### prefix

#### Get Signature

> **get** **prefix**(): `Option`\<`string`\>

Defined in: [alfa-dom/src/style/rule/namespace.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/namespace.ts)

##### Returns

`Option`\<`string`\>

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Namespace/JSON.md)

Defined in: [alfa-dom/src/style/rule/namespace.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/namespace.ts)

#### Returns

[`JSON`](Namespace/JSON.md)

#### Overrides

`BaseRule.toJSON`

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/style/rule/namespace.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/namespace.ts)

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

`BaseRule.type`
