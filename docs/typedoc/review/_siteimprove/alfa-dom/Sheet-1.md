# Class: Sheet

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

## Implements

- `Equatable`
- `Serializable`

## Constructors

### Constructor

```ts
protected new Sheet(
   rules, 
   disabled, 
   condition): Sheet;
```

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

#### Parameters

##### rules

[`Rule`](Rule-1.md)[]

##### disabled

`boolean`

##### condition

`Option`\<`string`\>

#### Returns

`Sheet`

## children

### children()

```ts
children(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

#### Returns

`Iterable`\<[`Rule`](Rule-1.md)\>

## condition

### condition

#### Get Signature

```ts
get condition(): Option<string>;
```

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

##### Returns

`Option`\<`string`\>

## descendants

### descendants()

```ts
descendants(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

#### Returns

`Iterable`\<[`Rule`](Rule-1.md)\>

## disabled

### disabled

#### Get Signature

```ts
get disabled(): boolean;
```

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

##### Returns

`boolean`

## empty

### empty()

```ts
static empty(): Sheet;
```

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

#### Returns

`Sheet`

## equals

### equals()

```ts
equals(value): value is Sheet;
```

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

#### Parameters

##### value

`unknown`

#### Returns

`value is Sheet`

#### Implementation of

```ts
Equatable.equals
```

## of

### of()

```ts
static of(
   rules, 
   disabled?, 
   condition?): Sheet;
```

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

#### Parameters

##### rules

`Iterable`\<[`Rule`](Rule-1.md)\>

##### disabled?

`boolean` = `false`

##### condition?

`Option`\<`string`\> = `None`

#### Returns

`Sheet`

## rules

### rules

#### Get Signature

```ts
get rules(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

##### Returns

`Iterable`\<[`Rule`](Rule-1.md)\>

## toJSON

### toJSON()

```ts
toJSON(): JSON;
```

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

#### Returns

[`JSON`](Sheet/JSON.md)

#### Implementation of

```ts
Serializable.toJSON
```

## toString

### toString()

```ts
toString(): string;
```

Defined in: [alfa-dom/src/style/sheet.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/sheet.ts)

#### Returns

`string`
