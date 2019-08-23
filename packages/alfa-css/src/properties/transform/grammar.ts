import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, skip } from "@siteimprove/alfa-lang";
import { Token, Tokens, TokenType } from "../../alphabet";
import { Values } from "../../values";
import { FunctionArguments } from "../helpers/function-arguments";
import { Transform } from "./types";

const { isKeyword, number } = Values;

type Production<T extends Token> = Lang.Production<Token, Transform, T>;

const ident: Production<Tokens.Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    switch (token.value) {
      case "none":
        return Values.keyword(token.value);
    }

    return null;
  }
};

const functionName: Production<Tokens.FunctionName> = {
  token: TokenType.FunctionName,
  prefix(token, stream) {
    const args = new FunctionArguments(stream);

    if (args === null) {
      return null;
    }

    switch (token.value) {
      case "matrix": {
        const a = args.number();
        const b = args.number();
        const c = args.number();
        const d = args.number();
        const e = args.number();
        const f = args.number();

        if (
          a === false ||
          b === false ||
          c === false ||
          d === false ||
          e === false ||
          f === false
        ) {
          return null;
        }

        if (!args.done()) {
          return null;
        }

        return Values.list(
          Values.func("matrix", [
            a,
            b,
            number(0),
            number(0),
            c,
            d,
            number(0),
            number(0),
            number(0),
            number(0),
            number(1),
            number(0),
            e,
            f,
            number(0),
            number(1)
          ])
        );
      }

      case "rotate": {
        const zero = args.number();

        if (zero !== false) {
          if (zero.value !== 0 || !args.done()) {
            return null;
          }

          return Values.list(Values.func("rotate", [Values.angle(0, "deg")]));
        }

        const angle = args.angle();

        if (angle === false || !args.done()) {
          return null;
        }

        return Values.list(Values.func("rotate", [angle]));
      }

      case "translate": {
        const tx = args.length() || args.percentage();

        if (tx === false) {
          return null;
        }

        const ty = args.length() || args.percentage();

        if (!args.done()) {
          return null;
        }

        return Values.list(
          Values.func("translate", ty === false ? [tx] : [tx, ty])
        );
      }
    }

    return null;
  },
  infix(token, stream, expression, left) {
    if (isKeyword(left, "none")) {
      return null;
    }

    stream.backup(1);

    const right = expression();

    if (right === null || isKeyword(right, "none")) {
      return null;
    }

    return Values.list(...left.value, ...right.value);
  }
};

export const TransformGrammar: Grammar<Token, Transform> = new Grammar(
  [skip(TokenType.Whitespace), ident, functionName],
  () => null
);
