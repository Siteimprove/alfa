# Class: Event\<`INPUT`, `TARGET` *extends* `Hashable`, `QUESTION` *extends* [`Metadata`](../Question/Metadata.md), `SUBJECT`, `TYPE` *extends* [`Type`](Event/Type.md) = [`Type`](Event/Type.md), `NAME` *extends* `string` = `string`\>

## Implements

- `Serializable`\<[`JSON`](Event/JSON.md)\<`TYPE`, `NAME`\>\>

## Constructors

### Constructor

```typescript
new Event<INPUT, TARGET extends Hashable, QUESTION extends Metadata, SUBJECT, TYPE extends Type = Type, NAME extends string = string>(
   type: TYPE, 
   rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>, 
   name: NAME
): Event<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME>;
```

## name

### name

#### Get Signature

```typescript
get name(): NAME;
```

##### Returns

`NAME`

## of

### of()

```typescript
static of<INPUT, TARGET extends Hashable, QUESTION extends Metadata, SUBJECT, TYPE extends Type, NAME extends string>(
   type: TYPE, 
   rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>, 
   name: NAME
): Event<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME>;
```

## rule

### rule

#### Get Signature

```typescript
get rule(): Rule<INPUT, TARGET, QUESTION, SUBJECT>;
```

##### Returns

[`Rule`](../Rule-1.md)\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`\>

## toJSON

### toJSON()

```typescript
toJSON(): JSON<TYPE, NAME>;
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
