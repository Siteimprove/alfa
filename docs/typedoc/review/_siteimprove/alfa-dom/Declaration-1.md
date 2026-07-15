# Class: Declaration

## Implements

- `Equatable`
- `Serializable`

## Constructors

### Constructor

```typescript
protected new Declaration(
   name: string, 
   value: string, 
   important: boolean
): Declaration;
```

## _attachOwner

### \_attachOwner()

```typescript
_attachOwner(owner: Element): boolean;
```

## _attachParent

### \_attachParent()

```typescript
_attachParent(parent: Rule): boolean;
```

## ancestors

### ancestors()

```typescript
ancestors(): Iterable<Rule>;
```

## equals

### equals()

```typescript
equals(value: unknown): value is Declaration;
```

#### Implementation of

```ts
Equatable.equals
```

## important

### important

#### Get Signature

```typescript
get important(): boolean;
```

##### Returns

`boolean`

## name

### name

#### Get Signature

```typescript
get name(): string;
```

##### Returns

`string`

## of

### of()

```typescript
static of(
   name: string, 
   value: string, 
   important?: boolean
): Declaration;
```

## owner

### owner

#### Get Signature

```typescript
get owner(): Option<Element<string>>;
```

##### Returns

`Option`\<[`Element`](Element-1.md)\<`string`\>\>

## parent

### parent

#### Get Signature

```typescript
get parent(): Option<Rule>;
```

##### Returns

`Option`\<[`Rule`](Rule-1.md)\>

## toJSON

### toJSON()

```typescript
toJSON(): JSON;
```

#### Implementation of

```ts
Serializable.toJSON
```

## toString

### toString()

```typescript
toString(): string;
```

## value

### value

#### Get Signature

```typescript
get value(): string;
```

##### Returns

`string`
