# Writing a parser

This guide shows how to implement a simple parser using the [alfa-parser](https://github.com/Siteimprove/alfa/tree/main/packages/alfa-parser) package. The guide is based on the work done in https://github.com/Siteimprove/alfa/pull/1339.

## Background

The `alfa-parser` package contains functionality to make it easy to implement a parser. This package is used internally by Alfa to parse HTML, CSS etc., but it can be used for any parsing scenario.

For this guide we want to create a parser that parses the content of the HTML attribute `autocomplete`. The content of the attribute must follow a set of rules as defined in the [HTML specification](https://html.spec.whatwg.org/multipage/#autofill-detail-tokens).

## Defining the grammar

We refer to the rules defined in the specification as the grammar or the syntax of the `autocomplete` attribute. It must contain a space separated list of tokens in a specific order, some of which optional and some required depending on the precense of some preceding token. For example the following is an invalid use of the attribute
```HTML
<input autocomplete="section-blue billing home" />
```
This is invalid because the `home` token must be followed by a required token.

We can express the grammar as follows
```
[section] [addressType] (unmodifiable | [modifier] modifiable) [webauthn] EOF
```
where a token name sorounded by square brackets `[]` means it is an optional token, tokens seperated by a vertical line `|` means exactly one of the tokens must be present and `EOF` is a special token signaling that no more tokens are allowed.

Here the possible values for the tokens are not listed, but as an example `addressType` is defined as follows
```
addressType = "shipping" | "billing"
```
meaning that the token can either have the literal value of `shipping` or `billing`.

## Implementing the parser

Our strategy is to define individual parsers for each of the tokens and then use the functions available in the `alfa-parser` package to combine them into the final parser in such a way that it encodes the grammar defined above. The individual parsers will be very simple since they will only check that a token has one of the valid literal values for that token. If it does, it will return an `Ok` result with the parsed token and the rest of the tokens ready to be parsed by the next parser. If it doesn't, it will return an `Err` result with a message and the parsing will terminate.

Start by adding the following imports
```TS
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

const { either, end, option, right } = Parser;
```
The types from `alfa-result` will be used by the parser to signal failure and the `Slice` type is used by the parser to consume an array of tokens. The functions from the `Parser` namespace that we will be using has been stored as `const`s for convenience. 
