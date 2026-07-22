# Class: Namespace

## Extends

- `BaseRule`\<`"namespace"`\>

## Constructors

### Constructor

```ts
protected new Namespace(namespace: string, prefix: Option<string>): NamespaceRule;
```

#### Overrides

```ts
BaseRule<"namespace">.constructor
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
equals(value: unknown): value is Namespace;
```

#### Inherited from

```ts
BaseRule.equals
```

## namespace

### namespace

#### Get Signature

```ts
get namespace(): string;
```

## of

### of()

```ts
static of(namespace: string, prefix: Option<string>): NamespaceRule;
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

## prefix

### prefix

#### Get Signature

```ts
get prefix(): Option<string>;
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
