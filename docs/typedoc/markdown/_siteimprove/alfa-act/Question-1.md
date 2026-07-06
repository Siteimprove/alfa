[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-act](../alfa-act.md) / Question

# Class: Question\<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

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

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

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

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## _diagnostic

### \_diagnostic

> `protected` `readonly` **\_diagnostic**: [`Diagnostic`](Diagnostic-1.md)

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## _fallback

### \_fallback

> `protected` `readonly` **\_fallback**: `Option`\<`ANSWER`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## _message

### \_message

> `protected` `readonly` **\_message**: `string`

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## _quester

### \_quester

> `protected` `readonly` **\_quester**: `Mapper`\<`ANSWER`, `T`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## _subject

### \_subject

> `protected` `readonly` **\_subject**: `SUBJECT`

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## _type

### \_type

> `protected` `readonly` **\_type**: `TYPE`

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## _uri

### \_uri

> `protected` `readonly` **\_uri**: `URI`

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## answer

### answer()

> **answer**(`answer`): `T`

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

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

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `condition` | `boolean` |
| `answer` | `ANSWER` |

##### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

#### Call Signature

> **answerIf**(`predicate`, `answer`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `Predicate`\<`SUBJECT`, \[`CONTEXT`\]\> |
| `answer` | `ANSWER` |

##### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

#### Call Signature

> **answerIf**(`answer`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `answer` | `Option`\<`ANSWER`\> |

##### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

#### Call Signature

> **answerIf**(`answer`, `merger?`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `answer` | `Result`\<`ANSWER`, [`Diagnostic`](Diagnostic-1.md)\> |
| `merger?` | `Mapper`\<[`Diagnostic`](Diagnostic-1.md), [`Diagnostic`](Diagnostic-1.md), \[[`Diagnostic`](Diagnostic-1.md)\]\> |

##### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

#### Call Signature

> **answerIf**(`answer`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `answer` | `Result`\<`ANSWER`, `unknown`\> |

##### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

## apply

### apply()

> **apply**\<`U`\>(`mapper`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

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

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`CONTEXT`

## diagnostic

### diagnostic

#### Get Signature

> **get** **diagnostic**(): [`Diagnostic`](Diagnostic-1.md)

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

[`Diagnostic`](Diagnostic-1.md)

## fallback

### fallback

#### Get Signature

> **get** **fallback**(): `Option`\<`ANSWER`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`Option`\<`ANSWER`\>

## flatMap

### flatMap()

> **flatMap**\<`U`\>(`mapper`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

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

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

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

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Returns

`this is Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, T, string>`

## map

### map()

> **map**\<`U`\>(`mapper`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

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

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`string`

## of

### of()

> `static` **of**\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `URI`\>(`type`, `uri`, `message`, `subject`, `context`, `options?`): `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `ANSWER`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

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

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`SUBJECT`

## toJSON

### toJSON()

> **toJSON**(`options?`): [`JSON`](Question/JSON.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

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

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`TYPE`

## uri

### uri

#### Get Signature

> **get** **uri**(): `URI`

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`URI`
