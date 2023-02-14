# Writing a parser

This guide shows how to implement a simple parser using the [alfa-parser](https://github.com/Siteimprove/alfa/tree/main/packages/alfa-parser) package. The guide is based on the work done in [#1339][PR].

## Background

The `alfa-parser` package contains functionality to make it easy to implement a parser ([parsers combinators](https://en.wikipedia.org/wiki/Parser_combinator)). This package is used internally by Alfa to parse HTML, CSS etc., but it can be used for any parsing scenario.

For this guide we want to create a parser that parses the content of the HTML attribute `autocomplete`. The content of the attribute must follow a set of rules as defined in the [HTML specification](https://html.spec.whatwg.org/multipage/#autofill-detail-tokens).

## Defining the grammar

We refer to the rules defined in the specification as the grammar or the syntax of the `autocomplete` attribute. It must contain a space separated list of tokens in a specific order, some of which may be optional and some may be required depending on the precense of some preceding token. For example the following is an invalid use of the attribute
```HTML
<input autocomplete="section-blue billing home" />
```
This is invalid because the `home` token must be followed by a required token.

We can express the grammar as follows
```
[section] [addressType] (unmodifiable | [modifier] modifiable) [webauthn] EOF
```
where a token name surrounded by square brackets `[]` means it is an optional token, tokens separated by a vertical line `|` means exactly one of the tokens must be present and `EOF` is a special token signalling that no more tokens are allowed.

Here the possible values for the tokens are not listed, but as an example `addressType` is defined as follows
```
addressType ::= "shipping" | "billing"
```
meaning that the token can either have the literal value of `shipping` or `billing`.

## Implementing the parser

Our aim is to write a parser that consumes an array of tokens (in our case strings) and returns a result of either `Ok`, with the result and the rest of the tokens, or an `Err` result with a message containing relevant information on why the parsing failed.

The strategy is:
- write individual atomic parsers to parse each indivial token using string matching
- combine the atomic parsers using the combinators from `alfa-parser` into the final parser in such a way that it encodes the grammar

Start by adding the following imports
```TS
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

const { either, end, option, right } = Parser;
```
The types from `alfa-result` will be used by the parser to signal success or failure and the `Slice` type is used by the parser to consume an array of tokens in a memory efficient way. The functions, or combinators, from the `Parser` namespace that will be used have been stored as `const`s for convenience.

We will implement two of the "atomic" parsers and leave out the rest as they are very similar. In the actual implementation in [#1339][PR] this was done in a more general way where a function generates the parser from an array of literal values.

```TS
const section: Parser<Slice<string>, string, string> = (input: Slice<string>) => {
  const token = input.first(); // Get the next token
  
  if (token.isSome() && token.get().startsWith("section-")) { // Check if we got a token and it has a valid literal value
    return Result.of([input.rest(), token.get()]); // Return result containing the rest of the tokens and the parsed token
  }
  
  return Err.of(
    `Expected token beginning with \`section-\`, but got ${token}` // Return an error if we got an invalid token or `None`
  );
}
```
This code declares and initializes a const of type `Parser<Slice<string>, string, string>`. The first type parameter is the type of the input, the second is the type of the parsed token and the third type parameter is the error type contained in the `Err`, typically a string message. In our case the input is a collection of strings represented by `Slice<string>`, the token type is also `string` for this example, but if the grammar contained symbols in addition to literals, then it would typically be some union type to represent the possible symbols.

The implemtation of the `addressType` parser is very similar
```TS
const addressType: Parser<Slice<string>, string, string> = (input: Slice<string>) => {
  const token: Option<string> = input.first(); 
  
  if (token.isSome() && (token.get() === "shipping" || token.get() === "billing")) { 
    return Result.of([input.rest(), token.get()]); 
  }
  
  return Err.of(`Expected \`shipping\` or \`billing\`, but got ${token}`); 
}
```

Now let's imagine we also implemented the other parsers in a similar fashion. We are now ready to combine all the parsers using the parser combinators `option`, `either`, `right` and `end` to get the final parser.

```TS
const parse = right(
  option(section), // The attribute should optionally begin with a section token
  right(
    option(addressType), // Next, optionally an addressType token
    right(
      either( // Then, required, either an unmodifiable token or an optional modifier token followed by a modifiable token
        unmodifiable,
        right(option(modifier), modifiable)
      ),
      right(
        option(webauthn), // Finally, an optional webauthn token
        end((token) => `Expected EOF, but got ${token}`) // At this point no more tokens are allowed
      )
    )
  )
);
```
This code uses the `right` combinator to combine two parsers in such a way that only the output of the right one is passed on to next parser meaning that in the end, if the parsing was successful, the parser will only output the last parsed token which in our case will be EOF. This is because we are only interested in knowing if the parsing was successful and we don't really care about the output. Typically however the parser would output some kind of abstract representation of the input that could then be processed further.

We have now implemented a parser, so let's see how to use it
```TS
const result1 = parse(Slice.of(["section-blue", "shipping", "home", "tel", "webauthn"]));
console.dir(result1.isOk()); // prints true

const result2 = parse(Slice.of(["section-blue", "shipping", "home", "webauthn"]));
console.dir(result2.isOk()); // prints false since "webauthn" is not allowed to follow "home", a required token is missing
```

Note: We have left out the pre-processing of the raw input into a format that the parser can work with because it is so simple in this example, but typically this can be more complicated, in which case implementing a [lexer](https://en.wikipedia.org/wiki/Lex_(software)) might be necessary.

[PR]: https://github.com/Siteimprove/alfa/pull/1339
