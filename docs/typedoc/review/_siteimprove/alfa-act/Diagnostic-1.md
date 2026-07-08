# Class: Diagnostic

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

## Implements

- `Equatable`
- `Hashable`
- `Serializable`\<[`JSON`](Diagnostic/JSON.md)\>

## Constructors

### Constructor

```ts
protected new Diagnostic(message): Diagnostic;
```

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

#### Parameters

##### message

`string`

#### Returns

`Diagnostic`

## _message

### \_message

```ts
protected readonly _message: string;
```

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

## empty

### empty()

```ts
static empty(): Diagnostic;
```

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

#### Returns

`Diagnostic`

## equals

### equals()

#### Call Signature

```ts
equals(value): boolean;
```

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

##### Parameters

###### value

`Diagnostic`

##### Returns

`boolean`

##### Implementation of

```ts
Equatable.equals
```

#### Call Signature

```ts
equals(value): value is Diagnostic;
```

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

##### Parameters

###### value

`unknown`

##### Returns

`value is Diagnostic`

##### Implementation of

```ts
Equatable.equals
```

## hash

### hash()

```ts
hash(hash): void;
```

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

#### Parameters

##### hash

`Hash`

#### Returns

`void`

#### Implementation of

```ts
Hashable.hash
```

## message

### message

#### Get Signature

```ts
get message(): string;
```

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

##### Returns

`string`

## of

### of()

```ts
static of(message): Diagnostic;
```

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

#### Parameters

##### message

`string`

#### Returns

`Diagnostic`

## toJSON

### toJSON()

```ts
toJSON(options?): JSON;
```

Defined in: [alfa-act/src/expectation/diagnostic.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/diagnostic.ts)

#### Parameters

##### options?

`Options`

#### Returns

[`JSON`](Diagnostic/JSON.md)

#### Implementation of

```ts
Serializable.toJSON
```
