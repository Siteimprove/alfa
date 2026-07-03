[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-dom](../alfa-dom.md) / Declaration

# Class: Declaration

Defined in: [alfa-dom/src/style/declaration.ts:14](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts#L14)

## Implements

- `Equatable`
- `Serializable`

## Constructors

### Constructor

> `protected` **new Declaration**(`name`, `value`, `important`): `Declaration`

Defined in: [alfa-dom/src/style/declaration.ts:41](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts#L41)

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

Defined in: [alfa-dom/src/style/declaration.ts:116](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts#L116)

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

Defined in: [alfa-dom/src/style/declaration.ts:103](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts#L103)

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

Defined in: [alfa-dom/src/style/declaration.ts:67](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts#L67)

#### Returns

`Iterable`\<[`Rule`](Rule-1.md)\>

## equals

### equals()

> **equals**(`value`): `value is Declaration`

Defined in: [alfa-dom/src/style/declaration.ts:77](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts#L77)

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

Defined in: [alfa-dom/src/style/declaration.ts:55](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts#L55)

##### Returns

`boolean`

## name

### name

#### Get Signature

> **get** **name**(): `string`

Defined in: [alfa-dom/src/style/declaration.ts:47](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts#L47)

##### Returns

`string`

## of

### of()

> `static` **of**(`name`, `value`, `important?`): `Declaration`

Defined in: [alfa-dom/src/style/declaration.ts:15](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts#L15)

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

Defined in: [alfa-dom/src/style/declaration.ts:63](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts#L63)

##### Returns

`Option`\<[`Element`](Element-1.md)\<`string`\>\>

## parent

### parent

#### Get Signature

> **get** **parent**(): `Option`\<[`Rule`](Rule-1.md)\>

Defined in: [alfa-dom/src/style/declaration.ts:59](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts#L59)

##### Returns

`Option`\<[`Rule`](Rule-1.md)\>

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Declaration/JSON.md)

Defined in: [alfa-dom/src/style/declaration.ts:86](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts#L86)

#### Returns

[`JSON`](Declaration/JSON.md)

#### Implementation of

`Serializable.toJSON`

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/style/declaration.ts:94](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts#L94)

Returns a string representation of an object.

#### Returns

`string`

## value

### value

#### Get Signature

> **get** **value**(): `string`

Defined in: [alfa-dom/src/style/declaration.ts:51](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts#L51)

##### Returns

`string`
