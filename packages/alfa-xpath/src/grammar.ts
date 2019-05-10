import * as Lang from "@siteimprove/alfa-lang";
import { Char, Stream } from "@siteimprove/alfa-lang";
import { Mutable } from "@siteimprove/alfa-util";
import { Token, Tokens, TokenType } from "./alphabet";
import * as g from "./guards";
import * as t from "./types";
import { Expression, ExpressionType } from "./types";

type Production<T extends Token> = Lang.Production<Token, Expression, T>;

const name: Production<Tokens.Name> = {
  token: TokenType.Name,

  prefix(token, stream) {
    return axis(token, stream);
  },

  infix(token, stream, expression, left) {
    if (!g.isStepExpression(left) && !g.isPathExpression(left)) {
      return null;
    }

    const right = axis(token, stream);

    if (right === null) {
      return null;
    }

    const path: t.PathExpression = {
      type: ExpressionType.Path,
      left,
      right
    };

    return path;
  }
};

const character: Production<Tokens.Character> = {
  token: TokenType.Character,

  prefix(token, stream, expression) {
    return path(token, stream);
  },

  infix(token, stream, expression, left) {
    if (token.value === Char.Solidus) {
      const right = expression();

      if (right === null || !g.isStepExpression(right)) {
        return null;
      }

      if (!g.isStepExpression(left) && !g.isPathExpression(left)) {
        return null;
      }

      const path: t.PathExpression = {
        type: ExpressionType.Path,
        left,
        right
      };

      return path;
    }

    return null;
  }
};

export const Grammar: Lang.Grammar<Token, Expression> = new Lang.Grammar(
  [name, character],
  () => null
);

function axis(
  name: Tokens.Name,
  stream: Stream<Token>
): t.AxisExpression | null {
  const axis: Mutable<t.AxisExpression> = {
    type: ExpressionType.Axis,
    axis: "child"
  };

  if (name.prefix === undefined) {
    if (acceptCharacters(stream, "::")) {
      switch (name.value) {
        case "child":
        case "descendant":
        case "attribute":
        case "self":
        case "descendant-or-self":
        case "following-sibling":
        case "following":
        case "parent":
        case "ancestor":
        case "preceding-sibling":
        case "preceding":
        case "ancestor-or-self":
          axis.axis = name.value;
          break;

        default:
          return null;
      }

      const test = nodeTest(stream);

      if (test === null) {
        return null;
      }

      if (test !== true) {
        axis.test = test;
      }
    } else {
      axis.test = { name: name.value };
    }
  } else {
    axis.test = { prefix: name.prefix, name: name.value };
  }

  return axis;
}

function path(
  character: Tokens.Character,
  stream: Stream<Token>
): t.PathExpression | t.StepExpression | null {
  switch (character.value) {
    case Char.Solidus: {
      const self: t.AxisExpression = {
        type: ExpressionType.Axis,
        axis: "self"
      };

      const root: t.FunctionCallExpression = {
        type: ExpressionType.FunctionCall,
        prefix: "fn",
        name: "root",
        arity: 1,
        parameters: [self]
      };

      const next = stream.peek(0);

      if (
        next !== null &&
        next.type === TokenType.Character &&
        next.value === Char.Solidus
      ) {
        const self: t.AxisExpression = {
          type: ExpressionType.Axis,
          axis: "descendant-or-self"
        };

        const path: t.PathExpression = {
          type: ExpressionType.Path,
          left: root,
          right: self
        };

        return path;
      }

      return root;
    }

    case Char.Asterisk: {
      const axis: t.AxisExpression = {
        type: ExpressionType.Axis,
        axis: "child"
      };

      return axis;
    }

    case Char.AtSign: {
      const axis: Mutable<t.AxisExpression> = {
        type: ExpressionType.Axis,
        axis: "attribute"
      };

      const test = nodeTest(stream);

      if (test === null) {
        return null;
      }

      if (test !== true) {
        axis.test = test;
      }

      return axis;
    }
  }

  return null;
}

function nodeTest(stream: Stream<Token>): t.NodeTest | true | null {
  const next = stream.peek(0);

  if (next === null) {
    return null;
  }

  if (next.type === TokenType.Name) {
    stream.advance(1);
    return { name: next.value };
  }

  if (next.type === TokenType.Character && next.value === Char.Asterisk) {
    stream.advance(1);
    return true;
  }

  return null;
}

function acceptCharacters(stream: Stream<Token>, characters: string): boolean {
  const n = characters.length;

  for (let i = 0, n = characters.length; i < n; i++) {
    const token = stream.peek(i);

    if (
      token === null ||
      token.type !== TokenType.Character ||
      token.value !== characters.charCodeAt(i)
    ) {
      return false;
    }
  }

  stream.advance(n);

  return true;
}
