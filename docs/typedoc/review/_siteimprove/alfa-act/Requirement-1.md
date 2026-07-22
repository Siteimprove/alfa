# Abstract Class: Requirement\<T extends string = string, U extends string = string\>

## Implements

- `Equatable`
- `Serializable`\<[`JSON`](Requirement/JSON.md)\>
- `Serializable`\<[`EARL`](Requirement/EARL.md)\>

## Constructors

### Constructor

```ts
protected new Requirement<T extends string = string, U extends string = string>(type: T, uri: U): Requirement<T, U>;
```

## equals

### equals()

#### Call Signature

```ts
equals(value: Requirement): boolean;
```

##### Implementation of

```ts
Equatable.equals
```

#### Call Signature

```ts
equals(value: unknown): value is Requirement<T, U>;
```

##### Implementation of

```ts
Equatable.equals
```

## toEARL

### toEARL()

```ts
toEARL(): EARL;
```

#### Implementation of

```ts
earl.Serializable.toEARL
```

## toJSON

### toJSON()

```ts
toJSON(): JSON<T, U>;
```

#### Implementation of

```ts
json.Serializable.toJSON
```

## type

### type

#### Get Signature

```ts
get type(): T;
```

## uri

### uri

#### Get Signature

```ts
get uri(): U;
```
