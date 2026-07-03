[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-act](../alfa-act.md) / Outcome

# Abstract Class: Outcome\<I, T, Q, S, V\>

Defined in: [alfa-act/src/outcome.ts:29](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

I: type of Input for the associated rule
T: type of the rule's test target
Q: questions' metadata type
S: possible types of questions' subject.
V: type of outcome value

## Extended by

- [`Passed`](Outcome/Passed-2.md)
- [`Failed`](Outcome/Failed-2.md)
- [`CantTell`](Outcome/CantTell-2.md)
- [`Inapplicable`](Outcome/Inapplicable-2.md)

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `I` | - |
| `T` *extends* `Hashable` | - |
| `Q` *extends* [`Metadata`](Question/Metadata.md) | `object` |
| `S` | `T` |
| `V` *extends* [`Value`](Outcome/Value.md) | [`Value`](Outcome/Value.md) |

## Implements

- `Equatable`
- `Hashable`
- `Serializable`\<[`JSON`](Outcome/JSON.md)\<`V`\>\>
- `Serializable`\<[`EARL`](Outcome/EARL.md)\>
- `Serializable`\<`sarif.Result`\>

## Constructors

### Constructor

> `protected` **new Outcome**\<`I`, `T`, `Q`, `S`, `V`\>(`outcome`, `rule`, `mode`): `Outcome`\<`I`, `T`, `Q`, `S`, `V`\>

Defined in: [alfa-act/src/outcome.ts:57](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `outcome` | `V` |
| `rule` | [`Rule`](Rule-1.md)\<`I`, `T`, `Q`, `S`\> |
| `mode` | [`Mode`](Outcome/Mode.md) |

#### Returns

`Outcome`\<`I`, `T`, `Q`, `S`, `V`\>

## _mode

### \_mode

> `protected` `readonly` **\_mode**: [`Mode`](Outcome/Mode.md)

Defined in: [alfa-act/src/outcome.ts:55](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

[https://www.w3.org/TR/EARL10-Schema/#mode](https://www.w3.org/TR/EARL10-Schema/#mode)

## _rule

### \_rule

> `protected` `readonly` **\_rule**: [`Rule`](Rule-1.md)\<`I`, `T`, `Q`, `S`\>

Defined in: [alfa-act/src/outcome.ts:51](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

[https://www.w3.org/TR/EARL10-Schema/#test](https://www.w3.org/TR/EARL10-Schema/#test)
While this is called a "test" in EARL, in Alfa this is always a "rule".

## equals

### equals()

#### Call Signature

> **equals**\<`I`, `T`, `Q`, `S`, `V`\>(`value`): `boolean`

Defined in: [alfa-act/src/outcome.ts:97](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

Check if a value of the same type as this are equal.

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `I` | - |
| `T` *extends* `Hashable` | - |
| `Q` *extends* [`Metadata`](Question/Metadata.md) | - |
| `S` | - |
| `V` *extends* [`Value`](Outcome/Value.md) | [`Value`](Outcome/Value.md) |

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `Outcome`\<`I`, `T`, `Q`, `S`, `V`\> |

##### Returns

`boolean`

##### Remarks

This function does not further refine the type of the given value.

##### Implementation of

`Equatable.equals`

#### Call Signature

> **equals**(`value`): `value is Outcome<I, T, Q, S, V>`

Defined in: [alfa-act/src/outcome.ts:105](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

Check if a value of an unknown type is equal to this.

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

##### Returns

`value is Outcome<I, T, Q, S, V>`

##### Remarks

This function refines the type of the given value.

##### Implementation of

`Equatable.equals`

## hash

### hash()

> **hash**(`hash`): `void`

Defined in: [alfa-act/src/outcome.ts:116](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `hash` | `Hash` |

#### Returns

`void`

#### Implementation of

`Hashable.hash`

## isSemiAuto

### isSemiAuto

#### Get Signature

> **get** **isSemiAuto**(): `boolean`

Defined in: [alfa-act/src/outcome.ts:89](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Returns

`boolean`

## mode

### mode

#### Get Signature

> **get** **mode**(): [`Mode`](Outcome/Mode.md)

Defined in: [alfa-act/src/outcome.ts:85](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

[https://www.w3.org/TR/EARL10-Schema/#mode](https://www.w3.org/TR/EARL10-Schema/#mode)

##### Returns

[`Mode`](Outcome/Mode.md)

## outcome

### outcome

#### Get Signature

> **get** **outcome**(): `V`

Defined in: [alfa-act/src/outcome.ts:70](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

[https://www.w3.org/TR/EARL10-Schema/#outcome](https://www.w3.org/TR/EARL10-Schema/#outcome)

##### Returns

`V`

## rule

### rule

#### Get Signature

> **get** **rule**(): [`Rule`](Rule-1.md)\<`I`, `T`, `Q`, `S`\>

Defined in: [alfa-act/src/outcome.ts:78](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

[https://www.w3.org/TR/EARL10-Schema/#test](https://www.w3.org/TR/EARL10-Schema/#test)
While this is called a "test" in EARL, in Alfa this is always a "rule".

##### Returns

[`Rule`](Rule-1.md)\<`I`, `T`, `Q`, `S`\>

## target

### target

#### Get Signature

> **get** **target**(): `T` \| `undefined`

Defined in: [alfa-act/src/outcome.ts:93](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Returns

`T` \| `undefined`

## toEARL

### toEARL()

> **toEARL**(): [`EARL`](Outcome/EARL.md)

Defined in: [alfa-act/src/outcome.ts:130](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Returns

[`EARL`](Outcome/EARL.md)

#### Implementation of

`earl.Serializable.toEARL`

## toJSON

### toJSON()

> **toJSON**(`options?`): [`JSON`](Outcome/JSON.md)\<`V`\>

Defined in: [alfa-act/src/outcome.ts:122](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `Options` |

#### Returns

[`JSON`](Outcome/JSON.md)\<`V`\>

#### Implementation of

`json.Serializable.toJSON`

## toSARIF

### toSARIF()

> `abstract` **toSARIF**(): `Result`

Defined in: [alfa-act/src/outcome.ts:143](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Returns

`Result`

#### Implementation of

`sarif.Serializable.toSARIF`
