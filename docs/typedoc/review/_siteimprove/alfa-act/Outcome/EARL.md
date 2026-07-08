# Interface: EARL

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

## Extends

- `EARL`

## Extended by

- [`EARL`](Passed/EARL.md)
- [`EARL`](Failed/EARL.md)
- [`EARL`](CantTell/EARL.md)
- [`EARL`](Inapplicable/EARL.md)

## Indexable

```ts
[key: string]: JSON | undefined
```

## @context

### @context?

```ts
optional @context?: {
  cnt?: "http://www.w3.org/2011/content#";
  dct?: "http://purl.org/dc/terms/";
  doap?: "http://usefulinc.com/ns/doap#";
  earl?: "http://www.w3.org/ns/earl#";
  foaf?: "http://xmlns.com/foaf/0.1/";
  http?: "http://www.w3.org/2011/http#";
  ptr?: "http://www.w3.org/2009/pointers#";
};
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

```ts
earl.EARL.@context
```

## @type

### @type

```ts
@type: "earl:Assertion";
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

## earl:mode

### earl:mode

```ts
earl:mode: "earl:automatic" | "earl:semiAuto" | "earl:manual";
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

## earl:test

### earl:test

```ts
earl:test: {
  @id: string;
};
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### @id

##### @id

```ts
@id: string;
```
