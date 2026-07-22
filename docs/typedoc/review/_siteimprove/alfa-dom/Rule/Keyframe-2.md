# Class: `Keyframe`

## Extends

- `BaseRule`\<`"keyframe"`\>

## Constructors

### Constructor

```ts
protected new Keyframe(key: string, declarations: Declaration[]): KeyframeRule;
```

#### Overrides

```ts
BaseRule<"keyframe">.constructor
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
equals(value: unknown): value is Keyframe;
```

#### Inherited from

```ts
BaseRule.equals
```

## key

### key

#### Get Signature

```ts
get key(): string;
```

## of

### of()

```ts
static of(key: string, declarations: Iterable<Declaration>): KeyframeRule;
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
