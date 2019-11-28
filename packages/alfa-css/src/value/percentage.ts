/**
 * @see https://drafts.csswg.org/css-values/#percentages
 */
export class Percentage {
  public static of(value: number): Percentage {
    return new Percentage(value);
  }

  public readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }
}
