# Class: `Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, T = ANSWER, URI extends string = string>`

## Extends

- [`Question`](../Question-1.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `T`, `URI`\>

## Constructors

### Constructor

```ts
new Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, T = ANSWER, URI extends string = string>(
   type: TYPE, 
   uri: URI, 
   message: string, 
   diagnostic: Diagnostic, 
   subject: SUBJECT, 
   context: CONTEXT, 
   answer: T
): Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

#### Overrides

[`Question`](../Question-1.md).[`constructor`](../Question-1.md#constructor)

## _context

### \_context

```ts
protected readonly _context: CONTEXT;
```

#### Inherited from

[`Question`](../Question-1.md).[`_context`](../Question-1.md#_context)

## _diagnostic

### \_diagnostic

```ts
protected readonly _diagnostic: Diagnostic;
```

#### Inherited from

[`Question`](../Question-1.md).[`_diagnostic`](../Question-1.md#_diagnostic)

## _fallback

### \_fallback

```ts
protected readonly _fallback: Option<ANSWER>;
```

#### Inherited from

[`Question`](../Question-1.md).[`_fallback`](../Question-1.md#_fallback)

## _message

### \_message

```ts
protected readonly _message: string;
```

#### Inherited from

[`Question`](../Question-1.md).[`_message`](../Question-1.md#_message)

## _quester

### \_quester

```ts
protected readonly _quester: Mapper<ANSWER, T>;
```

#### Inherited from

[`Question`](../Question-1.md).[`_quester`](../Question-1.md#_quester)

## _subject

### \_subject

```ts
protected readonly _subject: SUBJECT;
```

#### Inherited from

[`Question`](../Question-1.md).[`_subject`](../Question-1.md#_subject)

## _type

### \_type

```ts
protected readonly _type: TYPE;
```

#### Inherited from

[`Question`](../Question-1.md).[`_type`](../Question-1.md#_type)

## _uri

### \_uri

```ts
protected readonly _uri: URI;
```

#### Inherited from

[`Question`](../Question-1.md).[`_uri`](../Question-1.md#_uri)

## answer

### answer()

```ts
answer(): T;
```

#### Overrides

[`Question`](../Question-1.md).[`answer`](../Question-1.md#answer-1)

## answerIf

### answerIf()

#### Call Signature

```ts
answerIf(condition: boolean, answer: ANSWER): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

##### Inherited from

[`Question`](../Question-1.md).[`answerIf`](../Question-1.md#answerif)

#### Call Signature

```ts
answerIf(predicate: Predicate<SUBJECT, [CONTEXT]>, answer: ANSWER): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

##### Inherited from

[`Question`](../Question-1.md).[`answerIf`](../Question-1.md#answerif)

#### Call Signature

```ts
answerIf(answer: Option<ANSWER>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

##### Inherited from

[`Question`](../Question-1.md).[`answerIf`](../Question-1.md#answerif)

#### Call Signature

```ts
answerIf(answer: Result<ANSWER, Diagnostic>, merger?: Mapper<Diagnostic, Diagnostic, [Diagnostic]>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

##### Inherited from

[`Question`](../Question-1.md).[`answerIf`](../Question-1.md#answerif)

#### Call Signature

```ts
answerIf(answer: Result<ANSWER, unknown>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

##### Inherited from

[`Question`](../Question-1.md).[`answerIf`](../Question-1.md#answerif)

## apply

### apply()

```ts
apply<U>(mapper: Question<TYPE, SUBJECT, CONTEXT, ANSWER, Mapper<T, U>, URI>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>;
```

#### Inherited from

[`Question`](../Question-1.md).[`apply`](../Question-1.md#apply)

## context

### context

#### Get Signature

```ts
get context(): CONTEXT;
```

#### Inherited from

[`Question`](../Question-1.md).[`context`](../Question-1.md#context-1)

## diagnostic

### diagnostic

#### Get Signature

```ts
get diagnostic(): Diagnostic;
```

#### Inherited from

[`Question`](../Question-1.md).[`diagnostic`](../Question-1.md#diagnostic)

## fallback

### fallback

#### Get Signature

```ts
get fallback(): Option<ANSWER>;
```

#### Inherited from

[`Question`](../Question-1.md).[`fallback`](../Question-1.md#fallback)

## flatMap

### flatMap()

```ts
flatMap<U>(mapper: Mapper<T, Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>;
```

#### Inherited from

[`Question`](../Question-1.md).[`flatMap`](../Question-1.md#flatmap)

## flatten

### flatten()

```ts
flatten<TYPE, SUBJECT, CONTEXT, ANSWER, T>(this: Question<TYPE, SUBJECT, CONTEXT, ANSWER, Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, string>>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T>;
```

#### Inherited from

[`Question`](../Question-1.md).[`flatten`](../Question-1.md#flatten)

## isRhetorical

### isRhetorical()

```ts
isRhetorical(): this is Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, T, string>;
```

#### Inherited from

[`Question`](../Question-1.md).[`isRhetorical`](../Question-1.md#isrhetorical)

## map

### map()

```ts
map<U>(mapper: Mapper<T, U>): Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>;
```

#### Overrides

[`Question`](../Question-1.md).[`map`](../Question-1.md#map)

## message

### message

#### Get Signature

```ts
get message(): string;
```

#### Inherited from

[`Question`](../Question-1.md).[`message`](../Question-1.md#message)

## of

### of()

```ts
static of<TYPE, SUBJECT, CONTEXT, ANSWER, URI extends string = string>(
   type: TYPE, 
   uri: URI, 
   message: string, 
   subject: SUBJECT, 
   context: CONTEXT, 
   options?: Options<ANSWER>
): Question<TYPE, SUBJECT, CONTEXT, ANSWER, ANSWER, URI>;
```

#### Inherited from

[`Question`](../Question-1.md).[`of`](../Question-1.md#of)

## subject

### subject

#### Get Signature

```ts
get subject(): SUBJECT;
```

#### Inherited from

[`Question`](../Question-1.md).[`subject`](../Question-1.md#subject-1)

## toJSON

### toJSON()

```ts
toJSON(options?: Options): JSON<TYPE, SUBJECT, CONTEXT, ANSWER, URI>;
```

#### Inherited from

[`Question`](../Question-1.md).[`toJSON`](../Question-1.md#tojson)

## type

### type

#### Get Signature

```ts
get type(): TYPE;
```

#### Inherited from

[`Question`](../Question-1.md).[`type`](../Question-1.md#type-1)

## uri

### uri

#### Get Signature

```ts
get uri(): URI;
```

#### Inherited from

[`Question`](../Question-1.md).[`uri`](../Question-1.md#uri-1)
