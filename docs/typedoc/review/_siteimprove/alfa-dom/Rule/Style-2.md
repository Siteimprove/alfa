# Class: Style

## Extends

- `BaseRule`\<`"style"`\>

## Constructors

### Constructor

```typescript
protected new Style(
   selector: string, 
   declarations: Declaration[], 
   hint: boolean
): StyleRule;
```

#### Overrides

```ts
BaseRule<"style">.constructor
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
equals(value: unknown): value is Style;
```

#### Inherited from

```ts
BaseRule.equals
```

## hint

### hint

#### Get Signature

```typescript
get hint(): boolean;
```

##### Returns

`boolean`

## of

### of()

```typescript
static of(
   selector: string, 
   declarations: Iterable<Declaration>, 
   hint?: boolean
): StyleRule;
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

## selector

### selector

#### Get Signature

```typescript
get selector(): string;
```

##### Returns

`string`

## style

### style

#### Get Signature

```typescript
get style(): Block;
```

##### Returns

[`Block`](../Block-1.md)

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
