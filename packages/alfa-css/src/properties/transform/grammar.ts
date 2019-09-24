import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, skip } from "@siteimprove/alfa-lang";
import { Token, Tokens, TokenType } from "../../alphabet";
import { Values } from "../../values";
import { FunctionArguments } from "../helpers/function-arguments";
import { Transform } from "./types";

const { isKeyword } = Values;

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
            Values.number(0),
            Values.number(0),
            c,
            d,
            Values.number(0),
            Values.number(0),
            Values.number(0),
            Values.number(0),
            Values.number(1),
            Values.number(0),
            e,
            f,
            Values.number(0),
            Values.number(1)
          ])
        );
      }

      case "rotate": {
        const zero = args.number();

        if (zero !== false) {
          if (zero.value !== 0 || !args.done()) {
            return null;
          }

          return Values.list(
            Values.func("rotate", [
              Values.number(0),
              Values.number(0),
              Values.number(1),
              Values.angle(0, "deg")
            ])
          );
        }

        const angle = args.angle();

        if (angle === false || !args.done()) {
          return null;
        }

        return Values.list(
          Values.func("rotate", [
            Values.number(0),
            Values.number(0),
            Values.number(1),
            angle
          ])
        );
      }

      case "rotate3d": {
        const x = args.number();

        if (x === false) {
          return null;
        }

        const y = args.number();

        if (y === false) {
          return null;
        }

        const z = args.number();

        if (z === false) {
          return null;
        }

        const zero = args.number();

        if (zero !== false) {
          if (zero.value !== 0 || !args.done()) {
            return null;
          }

          return Values.list(
            Values.func("rotate", [x, y, z, Values.angle(0, "deg")])
          );
        }

        const angle = args.angle();

        if (angle === false || !args.done()) {
          return null;
        }

        return Values.list(Values.func("rotate", [x, y, z, angle]));
      }

      case "rotateX": {
        const zero = args.number();

        if (zero !== false) {
          if (zero.value !== 0 || !args.done()) {
            return null;
          }

          return Values.list(
            Values.func("rotate", [
              Values.number(1),
              Values.number(0),
              Values.number(0),
              Values.angle(0, "deg")
            ])
          );
        }

        const angle = args.angle();

        if (angle === false || !args.done()) {
          return null;
        }

        return Values.list(
          Values.func("rotate", [
            Values.number(1),
            Values.number(0),
            Values.number(0),
            angle
          ])
        );
      }

      case "rotateY": {
        const zero = args.number();

        if (zero !== false) {
          if (zero.value !== 0 || !args.done()) {
            return null;
          }

          return Values.list(
            Values.func("rotate", [
              Values.number(0),
              Values.number(1),
              Values.number(0),
              Values.angle(0, "deg")
            ])
          );
        }

        const angle = args.angle();

        if (angle === false || !args.done()) {
          return null;
        }

        return Values.list(
          Values.func("rotate", [
            Values.number(0),
            Values.number(1),
            Values.number(0),
            angle
          ])
        );
      }

      case "rotateZ": {
        const zero = args.number();

        if (zero !== false) {
          if (zero.value !== 0 || !args.done()) {
            return null;
          }

          return Values.list(
            Values.func("rotate", [
              Values.number(0),
              Values.number(0),
              Values.number(1),
              Values.angle(0, "deg")
            ])
          );
        }

        const angle = args.angle();

        if (angle === false || !args.done()) {
          return null;
        }

        return Values.list(
          Values.func("rotate", [
            Values.number(0),
            Values.number(0),
            Values.number(1),
            angle
          ])
        );
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
          Values.func(
            "translate",
            ty === false ? [tx, Values.length(0, "px")] : [tx, ty]
          )
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
