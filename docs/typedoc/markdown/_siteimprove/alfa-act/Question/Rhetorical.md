[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-act](../../alfa-act.md) / [Question](../Question.md) / Rhetorical

# Class: Rhetorical\<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

**`Internal`**

A rhetorical question is a special type of question in which the answer is
part of the question itself. This is useful for cases where the answer to
a question may optionally be given by the entity asking the question. This
means that a question can be conditionally answered while still retaining
its monadic structure as the question isn't unwrapped to its answer.

## Extends

- [`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TYPE` | - |
| `SUBJECT` | - |
| `CONTEXT` | - |
| `ANSWER` | - |
| `T` | `ANSWER` |
| `URI` *extends* `string` | `string` |

## Constructors

### Constructor

> **new Rhetorical**\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>(`type`, `uri`, `message`, `diagnostic`, `subject`, `context`, `answer`): `Rhetorical`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `TYPE` |
| `uri` | `URI` |
| `message` | `string` |
| `diagnostic` | [`Diagnostic`](../Diagnostic-1.md) |
| `subject` | `SUBJECT` |
| `context` | `CONTEXT` |
| `answer` | `T` |

#### Returns

`Rhetorical`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

#### Overrides

[`Question`](../Question-1.md).[`constructor`](../Question-1.md#constructor)

## _context

### \_context

> `protected` `readonly` **\_context**: `CONTEXT`

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Inherited from

[`Question`](../Question-1.md).[`_context`](../Question-1.md#_context)

## _diagnostic

### \_diagnostic

> `protected` `readonly` **\_diagnostic**: [`Diagnostic`](../Diagnostic-1.md)

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Inherited from

[`Question`](../Question-1.md).[`_diagnostic`](../Question-1.md#_diagnostic)

## _fallback

### \_fallback

> `protected` `readonly` **\_fallback**: `Option`\<`ANSWER`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Inherited from

[`Question`](../Question-1.md).[`_fallback`](../Question-1.md#_fallback)

## _message

### \_message

> `protected` `readonly` **\_message**: `string`

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Inherited from

[`Question`](../Question-1.md).[`_message`](../Question-1.md#_message)

## _quester

### \_quester

> `protected` `readonly` **\_quester**: `Mapper`\<`ANSWER`, `T`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Inherited from

[`Question`](../Question-1.md).[`_quester`](../Question-1.md#_quester)

## _subject

### \_subject

> `protected` `readonly` **\_subject**: `SUBJECT`

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Inherited from

[`Question`](../Question-1.md).[`_subject`](../Question-1.md#_subject)

## _type

### \_type

> `protected` `readonly` **\_type**: `TYPE`

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Inherited from

[`Question`](../Question-1.md).[`_type`](../Question-1.md#_type)

## _uri

### \_uri

> `protected` `readonly` **\_uri**: `URI`

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Inherited from

[`Question`](../Question-1.md).[`_uri`](../Question-1.md#_uri)

## answer

### answer()

> **answer**(): `T`

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Returns

`T`

#### Overrides

[`Question`](../Question-1.md).[`answer`](../Question-1.md#answer-1)

## answerIf

### answerIf()

#### Call Signature

> **answerIf**(`condition`, `answer`): [`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `condition` | `boolean` |
| `answer` | `ANSWER` |

##### Returns

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

##### Inherited from

[`Question`](../Question-1.md).[`answerIf`](../Question-1.md#answerif)

#### Call Signature

> **answerIf**(`predicate`, `answer`): [`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `Predicate`\<`SUBJECT`, \[`CONTEXT`\]\> |
| `answer` | `ANSWER` |

##### Returns

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

##### Inherited from

[`Question`](../Question-1.md).[`answerIf`](../Question-1.md#answerif)

#### Call Signature

> **answerIf**(`answer`): [`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `answer` | `Option`\<`ANSWER`\> |

##### Returns

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

##### Inherited from

[`Question`](../Question-1.md).[`answerIf`](../Question-1.md#answerif)

#### Call Signature

> **answerIf**(`answer`, `merger?`): [`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `answer` | `Result`\<`ANSWER`, [`Diagnostic`](../Diagnostic-1.md)\> |
| `merger?` | `Mapper`\<[`Diagnostic`](../Diagnostic-1.md), [`Diagnostic`](../Diagnostic-1.md), \[[`Diagnostic`](../Diagnostic-1.md)\]\> |

##### Returns

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

##### Inherited from

[`Question`](../Question-1.md).[`answerIf`](../Question-1.md#answerif)

#### Call Signature

> **answerIf**(`answer`): [`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `answer` | `Result`\<`ANSWER`, `unknown`\> |

##### Returns

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

##### Inherited from

[`Question`](../Question-1.md).[`answerIf`](../Question-1.md#answerif)

## apply

### apply()

> **apply**\<`U`\>(`mapper`): [`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Type Parameters

| Type Parameter |
| ------ |
| `U` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `mapper` | [`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `Mapper`\<`T`, `U`\>, `URI`\> |

#### Returns

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

#### Inherited from

[`Question`](../Question-1.md).[`apply`](../Question-1.md#apply)

## context

### context

#### Get Signature

> **get** **context**(): `CONTEXT`

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`CONTEXT`

#### Inherited from

[`Question`](../Question-1.md).[`context`](../Question-1.md#context-1)

## diagnostic

### diagnostic

#### Get Signature

> **get** **diagnostic**(): [`Diagnostic`](../Diagnostic-1.md)

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

[`Diagnostic`](../Diagnostic-1.md)

#### Inherited from

[`Question`](../Question-1.md).[`diagnostic`](../Question-1.md#diagnostic)

## fallback

### fallback

#### Get Signature

> **get** **fallback**(): `Option`\<`ANSWER`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`Option`\<`ANSWER`\>

#### Inherited from

[`Question`](../Question-1.md).[`fallback`](../Question-1.md#fallback)

## flatMap

### flatMap()

> **flatMap**\<`U`\>(`mapper`): [`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Type Parameters

| Type Parameter |
| ------ |
| `U` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `mapper` | `Mapper`\<`T`, [`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>\> |

#### Returns

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

#### Inherited from

[`Question`](../Question-1.md).[`flatMap`](../Question-1.md#flatmap)

## flatten

### flatten()

> **flatten**\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`\>(`this`): [`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`\>

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
| `this` | [`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, [`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `string`\>\> |

#### Returns

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`\>

#### Inherited from

[`Question`](../Question-1.md).[`flatten`](../Question-1.md#flatten)

## isRhetorical

### isRhetorical()

> **isRhetorical**(): `this is Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, T, string>`

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Returns

`this is Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, T, string>`

#### Inherited from

[`Question`](../Question-1.md).[`isRhetorical`](../Question-1.md#isrhetorical)

## map

### map()

> **map**\<`U`\>(`mapper`): `Rhetorical`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

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

`Rhetorical`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

#### Remarks

Overriding (Question:class).map ensures that the answer to a
rhetorical question is not lost as the question is transformed.

#### Overrides

[`Question`](../Question-1.md).[`map`](../Question-1.md#map)

## message

### message

#### Get Signature

> **get** **message**(): `string`

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`string`

#### Inherited from

[`Question`](../Question-1.md).[`message`](../Question-1.md#message)

## of

### of()

> `static` **of**\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `URI`\>(`type`, `uri`, `message`, `subject`, `context`, `options?`): [`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `ANSWER`, `URI`\>

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
| `options` | [`Options`](Options.md)\<`ANSWER`\> |

#### Returns

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `ANSWER`, `URI`\>

#### Inherited from

[`Question`](../Question-1.md).[`of`](../Question-1.md#of)

## subject

### subject

#### Get Signature

> **get** **subject**(): `SUBJECT`

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`SUBJECT`

#### Inherited from

[`Question`](../Question-1.md).[`subject`](../Question-1.md#subject-1)

## toJSON

### toJSON()

> **toJSON**(`options?`): [`JSON`](JSON.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `URI`\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `Options` |

#### Returns

[`JSON`](JSON.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `URI`\>

#### Inherited from

[`Question`](../Question-1.md).[`toJSON`](../Question-1.md#tojson)

## type

### type

#### Get Signature

> **get** **type**(): `TYPE`

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`TYPE`

#### Inherited from

[`Question`](../Question-1.md).[`type`](../Question-1.md#type-1)

## uri

### uri

#### Get Signature

> **get** **uri**(): `URI`

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`URI`

#### Inherited from

[`Question`](../Question-1.md).[`uri`](../Question-1.md#uri-1)
