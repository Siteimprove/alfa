# Class: Question\<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI\>

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

```typescript
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

```typescript
answer(answer: ANSWER): T;
```

## answerIf

### answerIf()

#### Call Signature

```typescript
answerIf(condition: boolean, answer: ANSWER): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

#### Call Signature

```typescript
answerIf(predicate: Predicate<SUBJECT, [CONTEXT]>, answer: ANSWER): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

#### Call Signature

```typescript
answerIf(answer: Option<ANSWER>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

#### Call Signature

```typescript
answerIf(answer: Result<ANSWER, Diagnostic>, merger?: Mapper<Diagnostic, Diagnostic, [Diagnostic]>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

#### Call Signature

```typescript
answerIf(answer: Result<ANSWER, unknown>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```

## apply

### apply()

```typescript
apply<U>(mapper: Question<TYPE, SUBJECT, CONTEXT, ANSWER, Mapper<T, U>, URI>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>;
```

#### Implementation of

```ts
Applicative.apply
```

## context

### context

#### Get Signature

```typescript
get context(): CONTEXT;
```

##### Returns

`CONTEXT`

## diagnostic

### diagnostic

#### Get Signature

```typescript
get diagnostic(): Diagnostic;
```

##### Returns

[`Diagnostic`](Diagnostic-1.md)

## fallback

### fallback

#### Get Signature

```typescript
get fallback(): Option<ANSWER>;
```

##### Returns

`Option`\<`ANSWER`\>

## flatMap

### flatMap()

```typescript
flatMap<U>(mapper: Mapper<T, Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>;
```

#### Implementation of

```ts
Monad.flatMap
```

## flatten

### flatten()

```typescript
flatten<TYPE, SUBJECT, CONTEXT, ANSWER, T>(this: Question<TYPE, SUBJECT, CONTEXT, ANSWER, Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, string>>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T>;
```

#### Implementation of

```ts
Monad.flatten
```

## isRhetorical

### isRhetorical()

```typescript
isRhetorical(): this is Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, T, string>;
```

## map

### map()

```typescript
map<U>(mapper: Mapper<T, U>): Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>;
```

#### Implementation of

```ts
Functor.map
```

## message

### message

#### Get Signature

```typescript
get message(): string;
```

##### Returns

`string`

## of

### of()

```typescript
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

```typescript
get subject(): SUBJECT;
```

##### Returns

`SUBJECT`

## toJSON

### toJSON()

```typescript
toJSON(options?: Options): JSON<TYPE, SUBJECT, CONTEXT, ANSWER, URI>;
```

#### Implementation of

```ts
Serializable.toJSON
```

## type

### type

#### Get Signature

```typescript
get type(): TYPE;
```

##### Returns

`TYPE`

## uri

### uri

#### Get Signature

```typescript
get uri(): URI;
```

##### Returns

`URI`
