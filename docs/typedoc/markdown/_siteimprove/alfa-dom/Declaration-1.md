[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-dom](../alfa-dom.md) / Declaration

# Class: Declaration

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

## Implements

- `Equatable`
- `Serializable`

## Constructors

### Constructor

> `protected` **new Declaration**(`name`, `value`, `important`): `Declaration`

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |
| `value` | `string` |
| `important` | `boolean` |

#### Returns

`Declaration`

## _attachOwner

### \_attachOwner()

> **\_attachOwner**(`owner`): `boolean`

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

**`Internal`**

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `owner` | [`Element`](Element-1.md) |

#### Returns

`boolean`

## _attachParent

### \_attachParent()

> **\_attachParent**(`parent`): `boolean`

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

**`Internal`**

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `parent` | [`Rule`](Rule-1.md) |

#### Returns

`boolean`

## ancestors

### ancestors()

> **ancestors**(): `Iterable`\<[`Rule`](Rule-1.md)\>

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

#### Returns

`Iterable`\<[`Rule`](Rule-1.md)\>

## equals

### equals()

> **equals**(`value`): `value is Declaration`

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

Parent rule or owner element are ignored for declaration equality.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

#### Returns

`value is Declaration`

#### Implementation of

`Equatable.equals`

## important

### important

#### Get Signature

> **get** **important**(): `boolean`

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

##### Returns

`boolean`

## name

### name

#### Get Signature

> **get** **name**(): `string`

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

##### Returns

`string`

## of

### of()

> `static` **of**(`name`, `value`, `important?`): `Declaration`

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `name` | `string` | `undefined` |
| `value` | `string` | `undefined` |
| `important` | `boolean` | `false` |

#### Returns

`Declaration`

## owner

### owner

#### Get Signature

> **get** **owner**(): `Option`\<[`Element`](Element-1.md)\<`string`\>\>

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

##### Returns

`Option`\<[`Element`](Element-1.md)\<`string`\>\>

## parent

### parent

#### Get Signature

> **get** **parent**(): `Option`\<[`Rule`](Rule-1.md)\>

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

##### Returns

`Option`\<[`Rule`](Rule-1.md)\>

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Declaration/JSON.md)

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

#### Returns

[`JSON`](Declaration/JSON.md)

#### Implementation of

`Serializable.toJSON`

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

Returns a string representation of an object.

#### Returns

`string`

## value

### value

#### Get Signature

> **get** **value**(): `string`

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

##### Returns

`string`
