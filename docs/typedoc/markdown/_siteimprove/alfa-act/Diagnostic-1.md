[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-act](../alfa-act.md) / Diagnostic

# Class: Diagnostic

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

Diagnostics are associated with each Question or final Outcome. They at least
contain an explanatory message. Diagnostics can be extended to include more
information for the rules that need it.

## Implements

- `Equatable`
- `Hashable`
- `Serializable`\<[`JSON`](Diagnostic/JSON.md)\>

## Constructors

### Constructor

> `protected` **new Diagnostic**(`message`): `Diagnostic`

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |

#### Returns

`Diagnostic`

## _message

### \_message

> `protected` `readonly` **\_message**: `string`

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

## empty

### empty()

> `static` **empty**(): `Diagnostic`

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

#### Returns

`Diagnostic`

## equals

### equals()

#### Call Signature

> **equals**(`value`): `boolean`

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

Check if a value of the same type as this are equal.

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `Diagnostic` |

##### Returns

`boolean`

##### Remarks

This function does not further refine the type of the given value.

##### Implementation of

`Equatable.equals`

#### Call Signature

> **equals**(`value`): `value is Diagnostic`

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

Check if a value of an unknown type is equal to this.

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

##### Returns

`value is Diagnostic`

##### Remarks

This function refines the type of the given value.

##### Implementation of

`Equatable.equals`

## hash

### hash()

> **hash**(`hash`): `void`

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `hash` | `Hash` |

#### Returns

`void`

#### Implementation of

`Hashable.hash`

## message

### message

#### Get Signature

> **get** **message**(): `string`

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

##### Returns

`string`

## of

### of()

> `static` **of**(`message`): `Diagnostic`

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |

#### Returns

`Diagnostic`

## toJSON

### toJSON()

> **toJSON**(`options?`): [`JSON`](Diagnostic/JSON.md)

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `Options` |

#### Returns

[`JSON`](Diagnostic/JSON.md)

#### Implementation of

`Serializable.toJSON`
