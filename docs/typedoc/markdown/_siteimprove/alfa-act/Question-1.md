[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-act](../alfa-act.md) / Question

# Class: Question\<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI\>

Defined in: [alfa-act/src/expectation/question.ts:33](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L33)

* TYPE is a (JavaScript manipulable) representation of the expected type of
  answers. It allows oracles and such to act on it. It can be an Enum, an ID,
  a union of string literals, …
* SUBJECT is the subject of the question.
* CONTEXT is the context, some extra info added to help the subject make sense.
  By convention, the context is *always* the test target (or potential test
  target when questions are asked in Applicability).
* ANSWER is the expected type of the answer.
* T is the final result of the question, after transformation. This gives a
  monadic structure to the question and allow manipulation of the answer
  without breaking the Question structure.
* URI is a unique identifier for the question.

## Extended by

- [`Rhetorical`](Question/Rhetorical.md)

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TYPE` | - |
| `SUBJECT` | - |
| `CONTEXT` | - |
| `ANSWER` | - |
| `T` | `ANSWER` |
| `URI` *extends* `string` | `string` |

## Implements

- `Functor`\<`T`\>
- `Applicative`\<`T`\>
- `Monad`\<`T`\>
- `Serializable`\<[`JSON`](Question/JSON.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `URI`\>\>

## Constructors

### Constructor

> `protected` **new Question**\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>(`type`, `uri`, `message`, `diagnostic`, `fallback`, `subject`, `context`, `quester`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts:78](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L78)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `TYPE` |
| `uri` | `URI` |
| `message` | `string` |
| `diagnostic` | [`Diagnostic`](Diagnostic-1.md) |
| `fallback` | `Option`\<`ANSWER`\> |
| `subject` | `SUBJECT` |
| `context` | `CONTEXT` |
| `quester` | `Mapper`\<`ANSWER`, `T`\> |

#### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

## _context

### \_context

> `protected` `readonly` **\_context**: `CONTEXT`

Defined in: [alfa-act/src/expectation/question.ts:75](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L75)

## _diagnostic

### \_diagnostic

> `protected` `readonly` **\_diagnostic**: [`Diagnostic`](Diagnostic-1.md)

Defined in: [alfa-act/src/expectation/question.ts:72](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L72)

## _fallback

### \_fallback

> `protected` `readonly` **\_fallback**: `Option`\<`ANSWER`\>

Defined in: [alfa-act/src/expectation/question.ts:73](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L73)

## _message

### \_message

> `protected` `readonly` **\_message**: `string`

Defined in: [alfa-act/src/expectation/question.ts:71](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L71)

## _quester

### \_quester

> `protected` `readonly` **\_quester**: `Mapper`\<`ANSWER`, `T`\>

Defined in: [alfa-act/src/expectation/question.ts:76](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L76)

## _subject

### \_subject

> `protected` `readonly` **\_subject**: `SUBJECT`

Defined in: [alfa-act/src/expectation/question.ts:74](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L74)

## _type

### \_type

> `protected` `readonly` **\_type**: `TYPE`

Defined in: [alfa-act/src/expectation/question.ts:69](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L69)

## _uri

### \_uri

> `protected` `readonly` **\_uri**: `URI`

Defined in: [alfa-act/src/expectation/question.ts:70](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L70)

## answer

### answer()

> **answer**(`answer`): `T`

Defined in: [alfa-act/src/expectation/question.ts:136](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L136)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `answer` | `ANSWER` |

#### Returns

`T`

## answerIf

### answerIf()

#### Call Signature

> **answerIf**(`condition`, `answer`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts:140](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L140)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `condition` | `boolean` |
| `answer` | `ANSWER` |

##### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

#### Call Signature

> **answerIf**(`predicate`, `answer`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts:145](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L145)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `Predicate`\<`SUBJECT`, \[`CONTEXT`\]\> |
| `answer` | `ANSWER` |

##### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

#### Call Signature

> **answerIf**(`answer`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts:150](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L150)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `answer` | `Option`\<`ANSWER`\> |

##### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

#### Call Signature

> **answerIf**(`answer`, `merger?`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts:154](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L154)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `answer` | `Result`\<`ANSWER`, [`Diagnostic`](Diagnostic-1.md)\> |
| `merger?` | `Mapper`\<[`Diagnostic`](Diagnostic-1.md), [`Diagnostic`](Diagnostic-1.md), \[[`Diagnostic`](Diagnostic-1.md)\]\> |

##### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

#### Call Signature

> **answerIf**(`answer`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts:159](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L159)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `answer` | `Result`\<`ANSWER`, `unknown`\> |

##### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

## apply

### apply()

> **apply**\<`U`\>(`mapper`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts:253](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L253)

#### Type Parameters

| Type Parameter |
| ------ |
| `U` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `mapper` | `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `Mapper`\<`T`, `U`\>, `URI`\> |

#### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

#### Implementation of

`Applicative.apply`

## context

### context

#### Get Signature

> **get** **context**(): `CONTEXT`

Defined in: [alfa-act/src/expectation/question.ts:122](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L122)

##### Returns

`CONTEXT`

## diagnostic

### diagnostic

#### Get Signature

> **get** **diagnostic**(): [`Diagnostic`](Diagnostic-1.md)

Defined in: [alfa-act/src/expectation/question.ts:110](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L110)

##### Returns

[`Diagnostic`](Diagnostic-1.md)

## fallback

### fallback

#### Get Signature

> **get** **fallback**(): `Option`\<`ANSWER`\>

Defined in: [alfa-act/src/expectation/question.ts:114](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L114)

##### Returns

`Option`\<`ANSWER`\>

## flatMap

### flatMap()

> **flatMap**\<`U`\>(`mapper`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts:259](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L259)

#### Type Parameters

| Type Parameter |
| ------ |
| `U` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `mapper` | `Mapper`\<`T`, `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>\> |

#### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

#### Implementation of

`Monad.flatMap`

## flatten

### flatten()

> **flatten**\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`\>(`this`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`\>

Defined in: [alfa-act/src/expectation/question.ts:274](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L274)

#### Type Parameters

| Type Parameter |
| ------ |
| `TYPE` |
| `SUBJECT` |
| `CONTEXT` |
| `ANSWER` |
| `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `this` | `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `string`\>\> |

#### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`\>

#### Implementation of

`Monad.flatten`

## isRhetorical

### isRhetorical()

> **isRhetorical**(): `this is Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, T, string>`

Defined in: [alfa-act/src/expectation/question.ts:126](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L126)

#### Returns

`this is Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, T, string>`

## map

### map()

> **map**\<`U`\>(`mapper`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts:238](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L238)

#### Type Parameters

| Type Parameter |
| ------ |
| `U` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `mapper` | `Mapper`\<`T`, `U`\> |

#### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

#### Implementation of

`Functor.map`

## message

### message

#### Get Signature

> **get** **message**(): `string`

Defined in: [alfa-act/src/expectation/question.ts:106](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L106)

##### Returns

`string`

## of

### of()

> `static` **of**\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `URI`\>(`type`, `uri`, `message`, `subject`, `context`, `options?`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `ANSWER`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts:47](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L47)

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TYPE` | - |
| `SUBJECT` | - |
| `CONTEXT` | - |
| `ANSWER` | - |
| `URI` *extends* `string` | `string` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `TYPE` |
| `uri` | `URI` |
| `message` | `string` |
| `subject` | `SUBJECT` |
| `context` | `CONTEXT` |
| `options` | [`Options`](Question/Options.md)\<`ANSWER`\> |

#### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `ANSWER`, `URI`\>

## subject

### subject

#### Get Signature

> **get** **subject**(): `SUBJECT`

Defined in: [alfa-act/src/expectation/question.ts:118](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L118)

##### Returns

`SUBJECT`

## toJSON

### toJSON()

> **toJSON**(`options?`): [`JSON`](Question/JSON.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts:295](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L295)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `Options` |

#### Returns

[`JSON`](Question/JSON.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `URI`\>

#### Implementation of

`Serializable.toJSON`

## type

### type

#### Get Signature

> **get** **type**(): `TYPE`

Defined in: [alfa-act/src/expectation/question.ts:98](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L98)

##### Returns

`TYPE`

## uri

### uri

#### Get Signature

> **get** **uri**(): `URI`

Defined in: [alfa-act/src/expectation/question.ts:102](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts#L102)

##### Returns

`URI`
