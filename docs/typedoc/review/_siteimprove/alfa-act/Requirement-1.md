# Abstract Class: Requirement\<`T` *extends* `string` = `string`, `U` *extends* `string` = `string`\>

## Implements

- `Equatable`
- `Serializable`\<[`JSON`](Requirement/JSON.md)\>
- `Serializable`\<[`EARL`](Requirement/EARL.md)\>

## Constructors

### Constructor

```typescript
protected new Requirement<T extends string = string, U extends string = string>(type: T, uri: U): Requirement<T, U>;
```

## equals

### equals()

#### Call Signature

```typescript
equals(value: Requirement): boolean;
```

##### Implementation of

```ts
Equatable.equals
```

#### Call Signature

```typescript
equals(value: unknown): value is Requirement<T, U>;
```

##### Implementation of

```ts
Equatable.equals
```

## toEARL

### toEARL()

```typescript
toEARL(): EARL;
```

#### Implementation of

```ts
earl.Serializable.toEARL
```

## toJSON

### toJSON()

```typescript
toJSON(): JSON<T, U>;
```

#### Implementation of

```ts
json.Serializable.toJSON
```

## type

### type

#### Get Signature

```typescript
get type(): T;
```

##### Returns

`T`

## uri

### uri

#### Get Signature

```typescript
get uri(): U;
```

##### Returns

`U`
