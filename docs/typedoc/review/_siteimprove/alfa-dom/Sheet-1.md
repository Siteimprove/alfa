# Class: Sheet

## Implements

- `Equatable`
- `Serializable`

## Constructors

### Constructor

```typescript
protected new Sheet(
   rules: Rule[], 
   disabled: boolean, 
   condition: Option<string>
): Sheet;
```

## children

### children()

```typescript
children(): Iterable<Rule>;
```

## condition

### condition

#### Get Signature

```typescript
get condition(): Option<string>;
```

##### Returns

`Option`\<`string`\>

## descendants

### descendants()

```typescript
descendants(): Iterable<Rule>;
```

## disabled

### disabled

#### Get Signature

```typescript
get disabled(): boolean;
```

##### Returns

`boolean`

## empty

### empty()

```typescript
static empty(): Sheet;
```

## equals

### equals()

```typescript
equals(value: unknown): value is Sheet;
```

#### Implementation of

```ts
Equatable.equals
```

## of

### of()

```typescript
static of(
   rules: Iterable<Rule>, 
   disabled?: boolean, 
   condition?: Option<string>
): Sheet;
```

## rules

### rules

#### Get Signature

```typescript
get rules(): Iterable<Rule>;
```

##### Returns

`Iterable`\<[`Rule`](Rule-1.md)\>

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
