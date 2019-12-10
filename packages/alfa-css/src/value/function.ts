/**
 * @see https://drafts.csswg.org/css-values/#functional-notations
 */
export class Function<
  N extends string = string,
  A extends Array<unknown> = Array<unknown>
> {
  public static of<N extends string, A extends Array<unknown>>(
    name: N,
    args: A
  ): Function<N, A> {
    return new Function(name, args);
  }

  public readonly name: N;
  public readonly args: A;

  private constructor(name: N, args: A) {
    this.name = name;
    this.args = args;
  }
}
