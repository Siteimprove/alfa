# Class: `Question<TYPE, SUBJECT, CONTEXT, ANSWER, T = ANSWER, URI extends string = string>`

## Extended by

- [`Rhetorical`](Question/Rhetorical.md)

## Implements

- `Functor`\<`T`\>
- `Applicative`\<`T`\>
- `Monad`\<`T`\>
- `Serializable`\<[`JSON`](Question/JSON.md)\<`TYPE`, `SUBJECT`, `CONTEXT`, `ANSWER`, `URI`\>\>

## Constructors

### Constructor

```ts
protected new Question<TYPE, SUBJECT, CONTEXT, ANSWER, T = ANSWER, URI extends string = string>(
   type: TYPE, 
   uri: URI, 
   message: string, 
   diagnostic: Diagnostic, 
   fallback: Option<ANSWER>, 
   subject: SUBJECT, 
   context: CONTEXT, 
   quester: Mapper<ANSWER, T>
): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

## _context

### \_context

```ts
protected readonly _context: CONTEXT;
```

## _diagnostic

### \_diagnostic

```ts
protected readonly _diagnostic: Diagnostic;
```

## _fallback

### \_fallback

```ts
protected readonly _fallback: Option<ANSWER>;
```

## _message

### \_message

```ts
protected readonly _message: string;
```

## _quester

### \_quester

```ts
protected readonly _quester: Mapper<ANSWER, T>;
```

## _subject

### \_subject

```ts
protected readonly _subject: SUBJECT;
```

## _type

### \_type

```ts
protected readonly _type: TYPE;
```

## _uri

### \_uri

```ts
protected readonly _uri: URI;
```

## answer

### answer()

```ts
answer(answer: ANSWER): T;
```

## answerIf

### answerIf()

#### Call Signature

```ts
answerIf(condition: boolean, answer: ANSWER): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

#### Call Signature

```ts
answerIf(predicate: Predicate<SUBJECT, [CONTEXT]>, answer: ANSWER): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

#### Call Signature

```ts
answerIf(answer: Option<ANSWER>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

#### Call Signature

```ts
answerIf(answer: Result<ANSWER, Diagnostic>, merger?: Mapper<Diagnostic, Diagnostic, [Diagnostic]>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

#### Call Signature

```ts
answerIf(answer: Result<ANSWER, unknown>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

## apply

### apply()

```ts
apply<U>(mapper: Question<TYPE, SUBJECT, CONTEXT, ANSWER, Mapper<T, U>, URI>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>;
```

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

## diagnostic

### diagnostic

#### Get Signature

```ts
get diagnostic(): Diagnostic;
```

## fallback

### fallback

#### Get Signature

```ts
get fallback(): Option<ANSWER>;
```

## flatMap

### flatMap()

```ts
flatMap<U>(mapper: Mapper<T, Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>;
```

#### Implementation of

```ts
Monad.flatMap
```

## flatten

### flatten()

```ts
flatten<TYPE, SUBJECT, CONTEXT, ANSWER, T>(this: Question<TYPE, SUBJECT, CONTEXT, ANSWER, Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, string>>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T>;
```

#### Implementation of

```ts
Monad.flatten
```

## isRhetorical

### isRhetorical()

```ts
isRhetorical(): this is Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, T, string>;
```

## map

### map()

```ts
map<U>(mapper: Mapper<T, U>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>;
```

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

## subject

### subject

#### Get Signature

```ts
get subject(): SUBJECT;
```

## toJSON

### toJSON()

```ts
toJSON(options?: Options): JSON<TYPE, SUBJECT, CONTEXT, ANSWER, URI>;
```

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

## uri

### uri

#### Get Signature

```ts
get uri(): URI;
```
