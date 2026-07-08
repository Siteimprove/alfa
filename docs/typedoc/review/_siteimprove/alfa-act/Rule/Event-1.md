# Class: Event\<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Type Parameters

### INPUT

`INPUT`

### TARGET

`TARGET` *extends* `Hashable`

### QUESTION

`QUESTION` *extends* [`Metadata`](../Question/Metadata.md)

### SUBJECT

`SUBJECT`

### TYPE

`TYPE` *extends* [`Type`](Event/Type.md) = [`Type`](Event/Type.md)

### NAME

`NAME` *extends* `string` = `string`

## Implements

- `Serializable`\<[`JSON`](Event/JSON.md)\<`TYPE`, `NAME`\>\>

## Constructors

### Constructor

```ts
new Event<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME>(
   type, 
   rule, 
name): Event<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Parameters

##### type

`TYPE`

##### rule

[`Rule`](../Rule-1.md)\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`\>

##### name

`NAME`

#### Returns

`Event`\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`, `TYPE`, `NAME`\>

## name

### name

#### Get Signature

```ts
get name(): NAME;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

`NAME`

## of

### of()

```ts
static of<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME>(
   type, 
   rule, 
name): Event<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Type Parameters

##### INPUT

`INPUT`

##### TARGET

`TARGET` *extends* `Hashable`

##### QUESTION

`QUESTION` *extends* [`Metadata`](../Question/Metadata.md)

##### SUBJECT

`SUBJECT`

##### TYPE

`TYPE` *extends* [`Type`](Event/Type.md)

##### NAME

`NAME` *extends* `string`

#### Parameters

##### type

`TYPE`

##### rule

[`Rule`](../Rule-1.md)\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`\>

##### name

`NAME`

#### Returns

`Event`\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`, `TYPE`, `NAME`\>

## rule

### rule

#### Get Signature

```ts
get rule(): Rule<INPUT, TARGET, QUESTION, SUBJECT>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

[`Rule`](../Rule-1.md)\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`\>

## toJSON

### toJSON()

```ts
toJSON(): JSON<TYPE, NAME>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Returns

[`JSON`](Event/JSON.md)\<`TYPE`, `NAME`\>

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

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

`TYPE`
