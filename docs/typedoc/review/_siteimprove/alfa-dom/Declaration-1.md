# Class: `Declaration`

## Implements

- `Equatable`
- `Serializable`

## Constructors

### Constructor

```ts
protected new Declaration(
   name: string, 
   value: string, 
   important: boolean
): Declaration;
```

## _attachOwner

### \_attachOwner()

```ts
_attachOwner(owner: Element): boolean;
```

## _attachParent

### \_attachParent()

```ts
_attachParent(parent: Rule): boolean;
```

## ancestors

### ancestors()

```ts
ancestors(): Iterable<Rule>;
```

## equals

### equals()

```ts
equals(value: unknown): value is Declaration;
```

#### Implementation of

```ts
Equatable.equals
```

## important

### important

#### Get Signature

```ts
get important(): boolean;
```

## name

### name

#### Get Signature

```ts
get name(): string;
```

## of

### of()

```ts
static of(
   name: string, 
   value: string, 
   important?: boolean
): Declaration;
```

## owner

### owner

#### Get Signature

```ts
get owner(): Option<Element<string>>;
```

## parent

### parent

#### Get Signature

```ts
get parent(): Option<Rule>;
```

## toJSON

### toJSON()

```ts
toJSON(): JSON;
```

#### Implementation of

```ts
Serializable.toJSON
```

## toString

### toString()

```ts
toString(): string;
```

## value

### value

#### Get Signature

```ts
get value(): string;
```
