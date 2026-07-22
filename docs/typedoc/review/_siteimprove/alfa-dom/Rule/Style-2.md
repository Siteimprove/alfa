# Class: Style

## Extends

- `BaseRule`\<`"style"`\>

## Constructors

### Constructor

```ts
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

```ts
_attachOwner(owner: Sheet): boolean;
```

#### Inherited from

```ts
BaseRule._attachOwner
```

## _attachParent

### \_attachParent()

```ts
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

```ts
ancestors(): Iterable<Rule>;
```

#### Inherited from

```ts
BaseRule.ancestors
```

## children

### children()

```ts
children(): Iterable<Rule>;
```

#### Inherited from

```ts
BaseRule.children
```

## descendants

### descendants()

```ts
descendants(): Iterable<Rule>;
```

#### Inherited from

```ts
BaseRule.descendants
```

## equals

### equals()

```ts
equals(value: unknown): value is Style;
```

#### Inherited from

```ts
BaseRule.equals
```

## hint

### hint

#### Get Signature

```ts
get hint(): boolean;
```

## of

### of()

```ts
static of(
   selector: string, 
   declarations: Iterable<Declaration>, 
   hint?: boolean
): StyleRule;
```

## owner

### owner

#### Get Signature

```ts
get owner(): Option<Sheet>;
```

#### Inherited from

```ts
BaseRule.owner
```

## parent

### parent

#### Get Signature

```ts
get parent(): Option<Rule>;
```

#### Inherited from

```ts
BaseRule.parent
```

## selector

### selector

#### Get Signature

```ts
get selector(): string;
```

## style

### style

#### Get Signature

```ts
get style(): Block;
```

## toJSON

### toJSON()

```ts
toJSON(): JSON;
```

#### Overrides

```ts
BaseRule.toJSON
```

## toString

### toString()

```ts
toString(): string;
```

## type

### type

#### Get Signature

```ts
get type(): T;
```

#### Inherited from

```ts
BaseRule.type
```
