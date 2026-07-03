[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-dom](../alfa-dom.md) / Sheet

# Class: Sheet

Defined in: [alfa-dom/src/style/sheet.ts:12](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts#L12)

## Implements

- `Equatable`
- `Serializable`

## Constructors

### Constructor

> `protected` **new Sheet**(`rules`, `disabled`, `condition`): `Sheet`

Defined in: [alfa-dom/src/style/sheet.ts:29](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts#L29)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `rules` | [`Rule`](Rule-1.md)[] |
| `disabled` | `boolean` |
| `condition` | `Option`\<`string`\> |

#### Returns

`Sheet`

## children

### children()

> **children**(): `Iterable`\<[`Rule`](Rule-1.md)\>

Defined in: [alfa-dom/src/style/sheet.ts:51](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts#L51)

#### Returns

`Iterable`\<[`Rule`](Rule-1.md)\>

## condition

### condition

#### Get Signature

> **get** **condition**(): `Option`\<`string`\>

Defined in: [alfa-dom/src/style/sheet.ts:47](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts#L47)

##### Returns

`Option`\<`string`\>

## descendants

### descendants()

> **descendants**(): `Iterable`\<[`Rule`](Rule-1.md)\>

Defined in: [alfa-dom/src/style/sheet.ts:55](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts#L55)

#### Returns

`Iterable`\<[`Rule`](Rule-1.md)\>

## disabled

### disabled

#### Get Signature

> **get** **disabled**(): `boolean`

Defined in: [alfa-dom/src/style/sheet.ts:43](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts#L43)

##### Returns

`boolean`

## empty

### empty()

> `static` **empty**(): `Sheet`

Defined in: [alfa-dom/src/style/sheet.ts:21](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts#L21)

#### Returns

`Sheet`

## equals

### equals()

> **equals**(`value`): `value is Sheet`

Defined in: [alfa-dom/src/style/sheet.ts:62](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts#L62)

Check if a value of the same type as this are equal.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

#### Returns

`value is Sheet`

#### Remarks

This function does not further refine the type of the given value.

#### Implementation of

`Equatable.equals`

## of

### of()

> `static` **of**(`rules`, `disabled?`, `condition?`): `Sheet`

Defined in: [alfa-dom/src/style/sheet.ts:13](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts#L13)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `rules` | `Iterable`\<[`Rule`](Rule-1.md)\> | `undefined` |
| `disabled` | `boolean` | `false` |
| `condition` | `Option`\<`string`\> | `None` |

#### Returns

`Sheet`

## rules

### rules

#### Get Signature

> **get** **rules**(): `Iterable`\<[`Rule`](Rule-1.md)\>

Defined in: [alfa-dom/src/style/sheet.ts:39](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts#L39)

##### Returns

`Iterable`\<[`Rule`](Rule-1.md)\>

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Sheet/JSON.md)

Defined in: [alfa-dom/src/style/sheet.ts:72](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts#L72)

#### Returns

[`JSON`](Sheet/JSON.md)

#### Implementation of

`Serializable.toJSON`

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/style/sheet.ts:80](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts#L80)

Returns a string representation of an object.

#### Returns

`string`
