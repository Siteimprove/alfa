[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-dom](../alfa-dom.md) / Sheet

# Class: Sheet

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

## Implements

- `Equatable`
- `Serializable`

## Constructors

### Constructor

> `protected` **new Sheet**(`rules`, `disabled`, `condition`): `Sheet`

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

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

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

#### Returns

`Iterable`\<[`Rule`](Rule-1.md)\>

## condition

### condition

#### Get Signature

> **get** **condition**(): `Option`\<`string`\>

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

##### Returns

`Option`\<`string`\>

## descendants

### descendants()

> **descendants**(): `Iterable`\<[`Rule`](Rule-1.md)\>

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

#### Returns

`Iterable`\<[`Rule`](Rule-1.md)\>

## disabled

### disabled

#### Get Signature

> **get** **disabled**(): `boolean`

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

##### Returns

`boolean`

## empty

### empty()

> `static` **empty**(): `Sheet`

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

#### Returns

`Sheet`

## equals

### equals()

> **equals**(`value`): `value is Sheet`

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

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

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

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

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

##### Returns

`Iterable`\<[`Rule`](Rule-1.md)\>

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Sheet/JSON.md)

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

#### Returns

[`JSON`](Sheet/JSON.md)

#### Implementation of

`Serializable.toJSON`

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

Returns a string representation of an object.

#### Returns

`string`
