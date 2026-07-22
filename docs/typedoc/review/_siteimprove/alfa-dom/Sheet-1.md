# Class: `Sheet`

## Implements

- `Equatable`
- `Serializable`

## Constructors

### Constructor

```ts
protected new Sheet(
   rules: Rule[], 
   disabled: boolean, 
   condition: Option<string>
): Sheet;
```

## children

### children()

```ts
children(): Iterable<Rule>;
```

## condition

### condition

#### Get Signature

```ts
get condition(): Option<string>;
```

## descendants

### descendants()

```ts
descendants(): Iterable<Rule>;
```

## disabled

### disabled

#### Get Signature

```ts
get disabled(): boolean;
```

## empty

### empty()

```ts
static empty(): Sheet;
```

## equals

### equals()

```ts
equals(value: unknown): value is Sheet;
```

#### Implementation of

```ts
Equatable.equals
```

## of

### of()

```ts
static of(
   rules: Iterable<Rule>, 
   disabled?: boolean, 
   condition?: Option<string>
): Sheet;
```

## rules

### rules

#### Get Signature

```ts
get rules(): Iterable<Rule>;
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
