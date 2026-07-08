# Class: Question\<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## Extended by

- [`Rhetorical`](Question/Rhetorical.md)

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

## Implements

- `Functor`\<`T`\>
- `Applicative`\<`T`\>
- `Monad`\<`T`\>
- `Serializable`\<[`JSON`](Question/JSON.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `URI`\>\>

## Constructors

### Constructor

```ts
protected new Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>(
   type: TYPE, 
   uri: URI, 
   message: string, 
   diagnostic: Diagnostic, 
   fallback: Option<ANSWER>, 
   subject: SUBJECT, 
   context: CONTEXT, 
quester: Mapper<ANSWER, T>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
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

[`Diagnostic`](Diagnostic-1.md)

##### fallback

`Option`\<`ANSWER`\>

##### subject

`SUBJECT`

##### context

`CONTEXT`

##### quester

`Mapper`\<`ANSWER`, `T`\>

#### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

## _context

### \_context

```ts
protected readonly _context: CONTEXT;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## _diagnostic

### \_diagnostic

```ts
protected readonly _diagnostic: Diagnostic;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## _fallback

### \_fallback

```ts
protected readonly _fallback: Option<ANSWER>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## _message

### \_message

```ts
protected readonly _message: string;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## _quester

### \_quester

```ts
protected readonly _quester: Mapper<ANSWER, T>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## _subject

### \_subject

```ts
protected readonly _subject: SUBJECT;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## _type

### \_type

```ts
protected readonly _type: TYPE;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## _uri

### \_uri

```ts
protected readonly _uri: URI;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## answer

### answer()

```ts
answer(answer: ANSWER): T;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Parameters

##### answer

`ANSWER`

#### Returns

`T`

## answerIf

### answerIf()

#### Call Signature

```ts
answerIf(condition: boolean, answer: ANSWER): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

###### condition

`boolean`

###### answer

`ANSWER`

##### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

#### Call Signature

```ts
answerIf(predicate: Predicate<SUBJECT, [CONTEXT]>, answer: ANSWER): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

###### predicate

`Predicate`\<`SUBJECT`, \[`CONTEXT`\]\>

###### answer

`ANSWER`

##### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

#### Call Signature

```ts
answerIf(answer: Option<ANSWER>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

###### answer

`Option`\<`ANSWER`\>

##### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

#### Call Signature

```ts
answerIf(answer: Result<ANSWER, Diagnostic>, merger?: Mapper<Diagnostic, Diagnostic, [Diagnostic]>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

###### answer

`Result`\<`ANSWER`, [`Diagnostic`](Diagnostic-1.md)\>

###### merger?

`Mapper`\<[`Diagnostic`](Diagnostic-1.md), [`Diagnostic`](Diagnostic-1.md), \[[`Diagnostic`](Diagnostic-1.md)\]\>

##### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

#### Call Signature

```ts
answerIf(answer: Result<ANSWER, unknown>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Parameters

###### answer

`Result`\<`ANSWER`, `unknown`\>

##### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

## apply

### apply()

```ts
apply<U>(mapper: Question<TYPE, SUBJECT, CONTEXT, ANSWER, Mapper<T, U>, URI>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Type Parameters

##### U

`U`

#### Parameters

##### mapper

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `Mapper`\<`T`, `U`\>, `URI`\>

#### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

#### Implementation of

```ts
Applicative.apply
```

## context

### context

#### Get Signature

```ts
get context(): CONTEXT;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`CONTEXT`

## diagnostic

### diagnostic

#### Get Signature

```ts
get diagnostic(): Diagnostic;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

[`Diagnostic`](Diagnostic-1.md)

## fallback

### fallback

#### Get Signature

```ts
get fallback(): Option<ANSWER>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`Option`\<`ANSWER`\>

## flatMap

### flatMap()

```ts
flatMap<U>(mapper: Mapper<T, Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Type Parameters

##### U

`U`

#### Parameters

##### mapper

`Mapper`\<`T`, `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>\>

#### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

#### Implementation of

```ts
Monad.flatMap
```

## flatten

### flatten()

```ts
flatten<TYPE, SUBJECT, CONTEXT, ANSWER, T>(this: Question<TYPE, SUBJECT, CONTEXT, ANSWER, Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, string>>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T>;
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

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `string`\>\>

#### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`\>

#### Implementation of

```ts
Monad.flatten
```

## isRhetorical

### isRhetorical()

```ts
isRhetorical(): this is Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, T, string>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Returns

`this is Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, T, string>`

## map

### map()

```ts
map<U>(mapper: Mapper<T, U>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Type Parameters

##### U

`U`

#### Parameters

##### mapper

`Mapper`\<`T`, `U`\>

#### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `U`, `URI`\>

#### Implementation of

```ts
Functor.map
```

## message

### message

#### Get Signature

```ts
get message(): string;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`string`

## of

### of()

```ts
static of<TYPE, SUBJECT, CONTEXT, ANSWER, URI>(
   type: TYPE, 
   uri: URI, 
   message: string, 
   subject: SUBJECT, 
   context: CONTEXT, 
options?: Options<ANSWER>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, ANSWER, URI>;
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

[`Options`](Question/Options.md)\<`ANSWER`\> = `{}`

#### Returns

`Question`\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `ANSWER`, `URI`\>

## subject

### subject

#### Get Signature

```ts
get subject(): SUBJECT;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`SUBJECT`

## toJSON

### toJSON()

```ts
toJSON(options?: Options): JSON<TYPE, SUBJECT, CONTEXT, ANSWER, URI>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

#### Parameters

##### options?

`Options`

#### Returns

[`JSON`](Question/JSON.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `URI`\>

#### Implementation of

```ts
Serializable.toJSON
```

## type

### type

#### Get Signature

```ts
get type(): TYPE;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`TYPE`

## uri

### uri

#### Get Signature

```ts
get uri(): URI;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

##### Returns

`URI`
