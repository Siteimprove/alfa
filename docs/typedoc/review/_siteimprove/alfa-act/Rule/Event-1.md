# Class: `Event<INPUT, TARGET extends Hashable, QUESTION extends Metadata, SUBJECT, TYPE extends Type = Type, NAME extends string = string>`

## Implements

- `Serializable`\<[`JSON`](Event/JSON.md)\<`TYPE`, `NAME`\>\>

## Constructors

### Constructor

```ts
new Event<INPUT, TARGET extends Hashable, QUESTION extends Metadata, SUBJECT, TYPE extends Type = Type, NAME extends string = string>(
   type: TYPE, 
   rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>, 
   name: NAME
): Event<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME>;
```

## name

### name

#### Get Signature

```ts
get name(): NAME;
```

## of

### of()

```ts
static of<INPUT, TARGET extends Hashable, QUESTION extends Metadata, SUBJECT, TYPE extends Type, NAME extends string>(
   type: TYPE, 
   rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>, 
   name: NAME
): Event<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME>;
```

## rule

### rule

#### Get Signature

```ts
get rule(): Rule<INPUT, TARGET, QUESTION, SUBJECT>;
```

## toJSON

### toJSON()

```ts
toJSON(): JSON<TYPE, NAME>;
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
