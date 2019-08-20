import { Stream } from "@siteimprove/alfa-lang";
import { Token, TokenType } from "../../alphabet";
import { Units } from "../../units";
import { Values } from "../../values";

export class FunctionArguments {
  private readonly stream: Stream<Token>;
  private readonly args: Array<Token> = [];
  private _done = false;

  public constructor(stream: Stream<Token>) {
    this.stream = stream;
  }

  public done(): boolean {
    return this._done;
  }

  private read(): boolean {
    if (this._done) {
      return false;
    }

    skipWhitespace(this.stream);

    let next = this.stream.peek(0);

    while (next !== null) {
      if (
        next.type === TokenType.Comma ||
        next.type === TokenType.RightParenthesis
      ) {
        return false;
      }

      this.args.push(next);

      this.stream.advance(1);

      skipWhitespace(this.stream);

      next = this.stream.peek(0);

      if (next !== null) {
        if (next.type === TokenType.Comma) {
          this.stream.advance(1);
        } else if (next.type === TokenType.RightParenthesis) {
          this.stream.advance(1);
          this._done = true;
        }
      }

      return true;
    }

    return false;
  }

  public peek(): Token | null {
    if (this.args.length === 0 && !this.read()) {
      return null;
    }

    return this.args[0];
  }

  public next(): Token | null {
    const next = this.peek();
    this.advance();
    return next;
  }

  public advance() {
    if (this.args.length !== 0) {
      this.args.shift();
    }
  }

  public number(): Values.Number | false {
    const next = this.peek();

    if (next === null || next.type !== TokenType.Number) {
      return false;
    }

    this.advance();

    return Values.number(next.value);
  }

  public percentage(): Values.Percentage | false {
    const next = this.peek();

    if (next === null || next.type !== TokenType.Percentage) {
      return false;
    }

    this.advance();

    return Values.percentage(next.value);
  }

  public length(): Values.Length | false {
    const next = this.peek();

    if (
      next === null ||
      next.type !== TokenType.Dimension ||
      !Units.isLength(next.unit)
    ) {
      return false;
    }

    this.advance();

    return Values.length(next.value, next.unit);
  }

  public angle(): Values.Angle | false {
    const next = this.peek();

    if (
      next === null ||
      next.type !== TokenType.Dimension ||
      !Units.isAngle(next.unit)
    ) {
      return false;
    }

    this.advance();

    return Values.angle(next.value, next.unit);
  }
}

function skipWhitespace(stream: Stream<Token>): void {
  let next = stream.peek(0);

  while (next !== null) {
    if (next.type === TokenType.Whitespace) {
      stream.advance(1);
      next = stream.peek(0);
    } else {
      break;
    }
  }
}
