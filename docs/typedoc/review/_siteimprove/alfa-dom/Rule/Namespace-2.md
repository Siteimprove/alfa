# Class: Namespace

## Extends

- `BaseRule`\<`"namespace"`\>

## Constructors

### Constructor

```typescript
protected new Namespace(namespace: string, prefix: Option<string>): NamespaceRule;
```

#### Overrides

```ts
BaseRule<"namespace">.constructor
```

## _attachOwner

### \_attachOwner()

```typescript
_attachOwner(owner: Sheet): boolean;
```

#### Inherited from

```ts
BaseRule._attachOwner
```

## _attachParent

### \_attachParent()

```typescript
_attachParent(parent: Rule): boolean;
```

#### Inherited from

```ts
BaseRule._attachParent
```

## _owner

### \_owner

```ts
protected _owner: Option<Sheet> = None;
```

#### Inherited from

```ts
BaseRule._owner
```

## _parent

### \_parent

```ts
protected _parent: Option<Rule> = None;
```

#### Inherited from

```ts
BaseRule._parent
```

## ancestors

### ancestors()

```typescript
ancestors(): Iterable<Rule>;
```

#### Inherited from

```ts
BaseRule.ancestors
```

## children

### children()

```typescript
children(): Iterable<Rule>;
```

#### Inherited from

```ts
BaseRule.children
```

## descendants

### descendants()

```typescript
descendants(): Iterable<Rule>;
```

#### Inherited from

```ts
BaseRule.descendants
```

## equals

### equals()

```typescript
equals(value: unknown): value is Namespace;
```

#### Inherited from

```ts
BaseRule.equals
```

## namespace

### namespace

#### Get Signature

```typescript
get namespace(): string;
```

##### Returns

`string`

## of

### of()

```typescript
static of(namespace: string, prefix: Option<string>): NamespaceRule;
```

## owner

### owner

#### Get Signature

```typescript
get owner(): Option<Sheet>;
```

##### Returns

`Option`\<[`Sheet`](../Sheet-1.md)\>

#### Inherited from

```ts
BaseRule.owner
```

## parent

### parent

#### Get Signature

```typescript
get parent(): Option<Rule>;
```

##### Returns

`Option`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

```ts
BaseRule.parent
```

## prefix

### prefix

#### Get Signature

```typescript
get prefix(): Option<string>;
```

##### Returns

`Option`\<`string`\>

## toJSON

### toJSON()

```typescript
toJSON(): JSON;
```

#### Overrides

```ts
BaseRule.toJSON
```

## toString

### toString()

```typescript
toString(): string;
```

## type

### type

#### Get Signature

```typescript
get type(): T;
```

##### Returns

`T`

#### Inherited from

```ts
BaseRule.type
```
