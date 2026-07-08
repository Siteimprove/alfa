# Class: Namespace

Defined in: [alfa-dom/src/style/rule/namespace.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/namespace.ts)

## Extends

- `BaseRule`\<`"namespace"`\>

## Constructors

### Constructor

```ts
protected new Namespace(namespace: string, prefix: Option<string>): NamespaceRule;
```

Defined in: [alfa-dom/src/style/rule/namespace.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/namespace.ts)

#### Parameters

##### namespace

`string`

##### prefix

`Option`\<`string`\>

#### Returns

`NamespaceRule`

#### Overrides

```ts
BaseRule<"namespace">.constructor
```

## _attachOwner

### \_attachOwner()

```ts
_attachOwner(owner: Sheet): boolean;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Parameters

##### owner

[`Sheet`](../Sheet-1.md)

#### Returns

`boolean`

#### Inherited from

```ts
BaseRule._attachOwner
```

## _attachParent

### \_attachParent()

```ts
_attachParent(parent: Rule): boolean;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Parameters

##### parent

[`Rule`](../Rule-1.md)

#### Returns

`boolean`

#### Inherited from

```ts
BaseRule._attachParent
```

## _owner

### \_owner

```ts
protected _owner: Option<Sheet> = None;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

```ts
BaseRule._owner
```

## _parent

### \_parent

```ts
protected _parent: Option<Rule> = None;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

```ts
BaseRule._parent
```

## ancestors

### ancestors()

```ts
ancestors(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

```ts
BaseRule.ancestors
```

## children

### children()

```ts
children(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

```ts
BaseRule.children
```

## descendants

### descendants()

```ts
descendants(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

```ts
BaseRule.descendants
```

## equals

### equals()

```ts
equals(value: unknown): value is Namespace;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Parameters

##### value

`unknown`

#### Returns

`value is Namespace`

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

Defined in: [alfa-dom/src/style/rule/namespace.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/namespace.ts)

##### Returns

`string`

## of

### of()

```ts
static of(namespace: string, prefix: Option<string>): NamespaceRule;
```

Defined in: [alfa-dom/src/style/rule/namespace.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/namespace.ts)

#### Parameters

##### namespace

`string`

##### prefix

`Option`\<`string`\>

#### Returns

`NamespaceRule`

## owner

### owner

#### Get Signature

```ts
get owner(): Option<Sheet>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Sheet`](../Sheet-1.md)\>

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

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Rule`](../Rule-1.md)\>

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

Defined in: [alfa-dom/src/style/rule/namespace.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/namespace.ts)

##### Returns

`Option`\<`string`\>

## toJSON

### toJSON()

```ts
toJSON(): JSON;
```

Defined in: [alfa-dom/src/style/rule/namespace.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/namespace.ts)

#### Returns

[`JSON`](Namespace/JSON.md)

#### Overrides

```ts
BaseRule.toJSON
```

## toString

### toString()

```ts
toString(): string;
```

Defined in: [alfa-dom/src/style/rule/namespace.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/namespace.ts)

#### Returns

`string`

## type

### type

#### Get Signature

```ts
get type(): T;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`T`

#### Inherited from

```ts
BaseRule.type
```
