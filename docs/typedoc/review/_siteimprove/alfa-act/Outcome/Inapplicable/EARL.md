# Interface: EARL

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

## Extends

- [`EARL`](../EARL.md)

## Indexable

```ts
[key: string]: JSON | undefined
```

## @context

### @context?

```ts
optional @context?: object;
```

Defined in: alfa-earl/dist/earl.d.ts

#### cnt

##### cnt?

```ts
optional cnt?: "http://www.w3.org/2011/content#";
```

#### dct

##### dct?

```ts
optional dct?: "http://purl.org/dc/terms/";
```

#### doap

##### doap?

```ts
optional doap?: "http://usefulinc.com/ns/doap#";
```

#### earl

##### earl?

```ts
optional earl?: "http://www.w3.org/ns/earl#";
```

#### foaf

##### foaf?

```ts
optional foaf?: "http://xmlns.com/foaf/0.1/";
```

#### http

##### http?

```ts
optional http?: "http://www.w3.org/2011/http#";
```

#### ptr

##### ptr?

```ts
optional ptr?: "http://www.w3.org/2009/pointers#";
```

#### Inherited from

[`EARL`](../EARL.md).[`@context`](../EARL.md#context)

## @type

### @type

```ts
@type: "earl:Assertion";
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Inherited from

[`EARL`](../EARL.md).[`@type`](../EARL.md#type)

## earl:mode

### earl:mode

```ts
earl:mode: "earl:automatic" | "earl:semiAuto" | "earl:manual";
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Inherited from

[`EARL`](../EARL.md).[`earl:mode`](../EARL.md#earlmode)

## earl:result

### earl:result

```ts
earl:result: object;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### @type

##### @type

```ts
@type: "earl:TestResult";
```

#### earl:outcome

##### earl:outcome

```ts
earl:outcome: object;
```

###### earl:outcome.@id

```ts
@id: "earl:inapplicable";
```

## earl:test

### earl:test

```ts
earl:test: object;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### @id

##### @id

```ts
@id: string;
```

#### Inherited from

[`EARL`](../EARL.md).[`earl:test`](../EARL.md#earltest)
