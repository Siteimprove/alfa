# Class: Rhetorical\<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## Extends

- [`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

## Type Parameters

### TYPE

`TYPE`

### SUBJECT

`SUBJECT`

### CONTEXT

`CONTEXT`

### ANSWER

`ANSWER`

### T

`T` = `ANSWER`

### URI

`URI` *extends* `string` = `string`

## Constructors

### Constructor

```ts
new Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>(
   type, 
   uri, 
   message, 
   diagnostic, 
   subject, 
   context, 
answer): Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Parameters

##### type

`TYPE`

##### uri

`URI`

##### message

`string`

##### diagnostic

[`Diagnostic`](../Diagnostic-1.md)

##### subject

`SUBJECT`

##### context

`CONTEXT`

##### answer

`T`

#### Returns

`Rhetorical`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

#### Overrides

[`Question`](../Question-1.md).[`constructor`](../Question-1.md#constructor)

## _context

### \_context

```ts
protected readonly _context: CONTEXT;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Inherited from

[`Question`](../Question-1.md).[`_context`](../Question-1.md#_context)

## _diagnostic

### \_diagnostic

```ts
protected readonly _diagnostic: Diagnostic;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Inherited from

[`Question`](../Question-1.md).[`_diagnostic`](../Question-1.md#_diagnostic)

## _fallback

### \_fallback

```ts
protected readonly _fallback: Option<ANSWER>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Inherited from

[`Question`](../Question-1.md).[`_fallback`](../Question-1.md#_fallback)

## _message

### \_message

```ts
protected readonly _message: string;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Inherited from

[`Question`](../Question-1.md).[`_message`](../Question-1.md#_message)

## _quester

### \_quester

```ts
protected readonly _quester: Mapper<ANSWER, T>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Inherited from

[`Question`](../Question-1.md).[`_quester`](../Question-1.md#_quester)

## _subject

### \_subject

```ts
protected readonly _subject: SUBJECT;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Inherited from

[`Question`](../Question-1.md).[`_subject`](../Question-1.md#_subject)

## _type

### \_type

```ts
protected readonly _type: TYPE;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Inherited from

[`Question`](../Question-1.md).[`_type`](../Question-1.md#_type)

## _uri

### \_uri

```ts
protected readonly _uri: URI;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Inherited from

[`Question`](../Question-1.md).[`_uri`](../Question-1.md#_uri)

## answer

### answer()

```ts
answer(): T;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Returns

`T`

#### Overrides

[`Question`](../Question-1.md).[`answer`](../Question-1.md#answer-1)

## answerIf

### answerIf()

#### Call Signature

```ts
answerIf(condition, answer): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

###### condition

`boolean`

###### answer

`ANSWER`

##### Returns

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

##### Inherited from

[`Question`](../Question-1.md).[`answerIf`](../Question-1.md#answerif)

#### Call Signature

```ts
answerIf(predicate, answer): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

###### predicate

`Predicate`\<`SUBJECT`, \[`CONTEXT`\]\>

###### answer

`ANSWER`

##### Returns

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

##### Inherited from

[`Question`](../Question-1.md).[`answerIf`](../Question-1.md#answerif)

#### Call Signature

```ts
answerIf(answer): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

###### answer

`Option`\<`ANSWER`\>

##### Returns

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

##### Inherited from

[`Question`](../Question-1.md).[`answerIf`](../Question-1.md#answerif)

#### Call Signature

```ts
answerIf(answer, merger?): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

###### answer

`Result`\<`ANSWER`, [`Diagnostic`](../Diagnostic-1.md)\>

###### merger?

`Mapper`\<[`Diagnostic`](../Diagnostic-1.md), [`Diagnostic`](../Diagnostic-1.md), \[[`Diagnostic`](../Diagnostic-1.md)\]\>

##### Returns

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

##### Inherited from

[`Question`](../Question-1.md).[`answerIf`](../Question-1.md#answerif)

#### Call Signature

```ts
answerIf(answer): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

###### answer

`Result`\<`ANSWER`, `unknown`\>

##### Returns

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

##### Inherited from

[`Question`](../Question-1.md).[`answerIf`](../Question-1.md#answerif)

## apply

### apply()

```ts
apply<U>(mapper): Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Type Parameters

##### U

`U`

#### Parameters

##### mapper

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `Mapper`\<`T`, `U`\>, `URI`\>

#### Returns

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

#### Inherited from

[`Question`](../Question-1.md).[`apply`](../Question-1.md#apply)

## context

### context

#### Get Signature

```ts
get context(): CONTEXT;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`CONTEXT`

#### Inherited from

[`Question`](../Question-1.md).[`context`](../Question-1.md#context-1)

## diagnostic

### diagnostic

#### Get Signature

```ts
get diagnostic(): Diagnostic;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

[`Diagnostic`](../Diagnostic-1.md)

#### Inherited from

[`Question`](../Question-1.md).[`diagnostic`](../Question-1.md#diagnostic)

## fallback

### fallback

#### Get Signature

```ts
get fallback(): Option<ANSWER>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`Option`\<`ANSWER`\>

#### Inherited from

[`Question`](../Question-1.md).[`fallback`](../Question-1.md#fallback)

## flatMap

### flatMap()

```ts
flatMap<U>(mapper): Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Type Parameters

##### U

`U`

#### Parameters

##### mapper

`Mapper`\<`T`, [`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>\>

#### Returns

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

#### Inherited from

[`Question`](../Question-1.md).[`flatMap`](../Question-1.md#flatmap)

## flatten

### flatten()

```ts
flatten<TYPE, SUBJECT, CONTEXT, ANSWER, T>(this): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Type Parameters

##### TYPE

`TYPE`

##### SUBJECT

`SUBJECT`

##### CONTEXT

`CONTEXT`

##### ANSWER

`ANSWER`

##### T

`T`

#### Parameters

##### this

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, [`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `string`\>\>

#### Returns

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`\>

#### Inherited from

[`Question`](../Question-1.md).[`flatten`](../Question-1.md#flatten)

## isRhetorical

### isRhetorical()

```ts
isRhetorical(): this is Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, T, string>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Returns

`this is Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, T, string>`

#### Inherited from

[`Question`](../Question-1.md).[`isRhetorical`](../Question-1.md#isrhetorical)

## map

### map()

```ts
map<U>(mapper): Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Type Parameters

##### U

`U`

#### Parameters

##### mapper

`Mapper`\<`T`, `U`\>

#### Returns

`Rhetorical`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

#### Overrides

[`Question`](../Question-1.md).[`map`](../Question-1.md#map)

## message

### message

#### Get Signature

```ts
get message(): string;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`string`

#### Inherited from

[`Question`](../Question-1.md).[`message`](../Question-1.md#message)

## of

### of()

```ts
static of<TYPE, SUBJECT, CONTEXT, ANSWER, URI>(
   type, 
   uri, 
   message, 
   subject, 
   context, 
options?): Question<TYPE, SUBJECT, CONTEXT, ANSWER, ANSWER, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Type Parameters

##### TYPE

`TYPE`

##### SUBJECT

`SUBJECT`

##### CONTEXT

`CONTEXT`

##### ANSWER

`ANSWER`

##### URI

`URI` *extends* `string` = `string`

#### Parameters

##### type

`TYPE`

##### uri

`URI`

##### message

`string`

##### subject

`SUBJECT`

##### context

`CONTEXT`

##### options?

[`Options`](Options.md)\<`ANSWER`\> = `{}`

#### Returns

[`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `ANSWER`, `URI`\>

#### Inherited from

[`Question`](../Question-1.md).[`of`](../Question-1.md#of)

## subject

### subject

#### Get Signature

```ts
get subject(): SUBJECT;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`SUBJECT`

#### Inherited from

[`Question`](../Question-1.md).[`subject`](../Question-1.md#subject-1)

## toJSON

### toJSON()

```ts
toJSON(options?): JSON<TYPE, SUBJECT, CONTEXT, ANSWER, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Parameters

##### options?

`Options`

#### Returns

[`JSON`](JSON.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `URI`\>

#### Inherited from

[`Question`](../Question-1.md).[`toJSON`](../Question-1.md#tojson)

## type

### type

#### Get Signature

```ts
get type(): TYPE;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`TYPE`

#### Inherited from

[`Question`](../Question-1.md).[`type`](../Question-1.md#type-1)

## uri

### uri

#### Get Signature

```ts
get uri(): URI;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`URI`

#### Inherited from

[`Question`](../Question-1.md).[`uri`](../Question-1.md#uri-1)
