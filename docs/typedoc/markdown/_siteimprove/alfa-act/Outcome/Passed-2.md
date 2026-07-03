[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-act](../../alfa-act.md) / [Outcome](../Outcome.md) / Passed

# Class: Passed\<I, T, Q, S\>

Defined in: [alfa-act/src/outcome.ts:186](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

## Extends

- [`Outcome`](../Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Passed`](Value.md#passed)\>

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `I` | - |
| `T` *extends* `Hashable` | - |
| `Q` *extends* [`Metadata`](../Question/Metadata.md) | `object` |
| `S` | `T` |

## Constructors

### Constructor

> `protected` **new Passed**\<`I`, `T`, `Q`, `S`\>(`rule`, `target`, `expectations`, `mode`): `Passed`\<`I`, `T`, `Q`, `S`\>

Defined in: [alfa-act/src/outcome.ts:208](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `rule` | [`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\> |
| `target` | `T` |
| `expectations` | `Record`\<\{\[`key`: `string`\]: `Result`\<[`Diagnostic`](../Diagnostic-1.md), [`Diagnostic`](../Diagnostic-1.md)\>; \}\> |
| `mode` | [`Mode`](Mode.md) |

#### Returns

`Passed`\<`I`, `T`, `Q`, `S`\>

#### Overrides

[`Outcome`](../Outcome-1.md).[`constructor`](../Outcome-1.md#constructor)

## _mode

### \_mode

> `protected` `readonly` **\_mode**: [`Mode`](Mode.md)

Defined in: [alfa-act/src/outcome.ts:55](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

[https://www.w3.org/TR/EARL10-Schema/#mode](https://www.w3.org/TR/EARL10-Schema/#mode)

#### Inherited from

[`Outcome`](../Outcome-1.md).[`_mode`](../Outcome-1.md#_mode)

## _rule

### \_rule

> `protected` `readonly` **\_rule**: [`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>

Defined in: [alfa-act/src/outcome.ts:51](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

[https://www.w3.org/TR/EARL10-Schema/#test](https://www.w3.org/TR/EARL10-Schema/#test)
While this is called a "test" in EARL, in Alfa this is always a "rule".

#### Inherited from

[`Outcome`](../Outcome-1.md).[`_rule`](../Outcome-1.md#_rule)

## equals

### equals()

#### Call Signature

> **equals**\<`I`, `T`, `Q`, `S`\>(`value`): `boolean`

Defined in: [alfa-act/src/outcome.ts:232](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

Check if a value of the same type as this are equal.

##### Type Parameters

| Type Parameter |
| ------ |
| `I` |
| `T` *extends* `Hashable` |
| `Q` *extends* [`Metadata`](../Question/Metadata.md) |
| `S` |

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `Passed`\<`I`, `T`, `Q`, `S`\> |

##### Returns

`boolean`

##### Remarks

This function does not further refine the type of the given value.

##### Overrides

[`Outcome`](../Outcome-1.md).[`equals`](../Outcome-1.md#equals)

#### Call Signature

> **equals**(`value`): `value is Passed<I, T, Q, S>`

Defined in: [alfa-act/src/outcome.ts:236](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

Check if a value of an unknown type is equal to this.

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

##### Returns

`value is Passed<I, T, Q, S>`

##### Remarks

This function refines the type of the given value.

##### Overrides

[`Outcome`](../Outcome-1.md).[`equals`](../Outcome-1.md#equals)

## expectations

### expectations

#### Get Signature

> **get** **expectations**(): `Record`\<\{\[`key`: `string`\]: `Result`\<[`Diagnostic`](../Diagnostic-1.md), [`Diagnostic`](../Diagnostic-1.md)\>; \}\>

Defined in: [alfa-act/src/outcome.ts:226](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Returns

`Record`\<\{\[`key`: `string`\]: `Result`\<[`Diagnostic`](../Diagnostic-1.md), [`Diagnostic`](../Diagnostic-1.md)\>; \}\>

## hash

### hash()

> **hash**(`hash`): `void`

Defined in: [alfa-act/src/outcome.ts:247](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `hash` | `Hash` |

#### Returns

`void`

#### Overrides

[`Outcome`](../Outcome-1.md).[`hash`](../Outcome-1.md#hash)

## isSemiAuto

### isSemiAuto

#### Get Signature

> **get** **isSemiAuto**(): `boolean`

Defined in: [alfa-act/src/outcome.ts:89](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Returns

`boolean`

#### Inherited from

[`Outcome`](../Outcome-1.md).[`isSemiAuto`](../Outcome-1.md#issemiauto)

## mode

### mode

#### Get Signature

> **get** **mode**(): [`Mode`](Mode.md)

Defined in: [alfa-act/src/outcome.ts:85](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

[https://www.w3.org/TR/EARL10-Schema/#mode](https://www.w3.org/TR/EARL10-Schema/#mode)

##### Returns

[`Mode`](Mode.md)

#### Inherited from

[`Outcome`](../Outcome-1.md).[`mode`](../Outcome-1.md#mode)

## of

### of()

> `static` **of**\<`I`, `T`, `Q`, `S`\>(`rule`, `target`, `expectations`, `mode`): `Passed`\<`I`, `T`, `Q`, `S`\>

Defined in: [alfa-act/src/outcome.ts:192](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Type Parameters

| Type Parameter |
| ------ |
| `I` |
| `T` *extends* `Hashable` |
| `Q` *extends* [`Metadata`](../Question/Metadata.md) |
| `S` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `rule` | [`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\> |
| `target` | `T` |
| `expectations` | `Record`\<\{\[`key`: `string`\]: `Result`\<[`Diagnostic`](../Diagnostic-1.md), [`Diagnostic`](../Diagnostic-1.md)\>; \}\> |
| `mode` | [`Mode`](Mode.md) |

#### Returns

`Passed`\<`I`, `T`, `Q`, `S`\>

## outcome

### outcome

#### Get Signature

> **get** **outcome**(): `V`

Defined in: [alfa-act/src/outcome.ts:70](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

[https://www.w3.org/TR/EARL10-Schema/#outcome](https://www.w3.org/TR/EARL10-Schema/#outcome)

##### Returns

`V`

#### Inherited from

[`Outcome`](../Outcome-1.md).[`outcome`](../Outcome-1.md#outcome)

## rule

### rule

#### Get Signature

> **get** **rule**(): [`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>

Defined in: [alfa-act/src/outcome.ts:78](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

[https://www.w3.org/TR/EARL10-Schema/#test](https://www.w3.org/TR/EARL10-Schema/#test)
While this is called a "test" in EARL, in Alfa this is always a "rule".

##### Returns

[`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>

#### Inherited from

[`Outcome`](../Outcome-1.md).[`rule`](../Outcome-1.md#rule)

## target

### target

#### Get Signature

> **get** **target**(): `T`

Defined in: [alfa-act/src/outcome.ts:222](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Returns

`T`

#### Overrides

[`Outcome`](../Outcome-1.md).[`target`](../Outcome-1.md#target)

## toEARL

### toEARL()

> **toEARL**(): [`EARL`](Passed/EARL.md)

Defined in: [alfa-act/src/outcome.ts:266](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Returns

[`EARL`](Passed/EARL.md)

#### Overrides

[`Outcome`](../Outcome-1.md).[`toEARL`](../Outcome-1.md#toearl)

## toJSON

### toJSON()

> **toJSON**(`options?`): [`JSON`](Passed/JSON.md)\<`T`\>

Defined in: [alfa-act/src/outcome.ts:256](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `Options` |

#### Returns

[`JSON`](Passed/JSON.md)\<`T`\>

#### Overrides

[`Outcome`](../Outcome-1.md).[`toJSON`](../Outcome-1.md#tojson)

## toSARIF

### toSARIF()

> **toSARIF**(): `Result`

Defined in: [alfa-act/src/outcome.ts:293](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Returns

`Result`

#### Overrides

[`Outcome`](../Outcome-1.md).[`toSARIF`](../Outcome-1.md#tosarif)
