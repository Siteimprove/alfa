import chalk from "chalk";

export interface Marker {
  (value: string): string;

  // Styles
  readonly reset: this;
  readonly bold: this;
  readonly dim: this;
  readonly italic: this;
  readonly underline: this;
  readonly inverse: this;
  readonly hidden: this;
  readonly strikethrough: this;

  // Colors
  readonly black: this;
  readonly red: this;
  readonly green: this;
  readonly yellow: this;
  readonly blue: this;
  readonly magenta: this;
  readonly cyan: this;
  readonly white: this;
  readonly gray: this;
}

export namespace Markers {
  // Styles
  export const reset: Marker = chalk.reset;
  export const bold: Marker = chalk.bold;
  export const dim: Marker = chalk.dim;
  export const italic: Marker = chalk.italic;
  export const underline: Marker = chalk.underline;
  export const inverse: Marker = chalk.inverse;
  export const hidden: Marker = chalk.hidden;
  export const strikethrough: Marker = chalk.strikethrough;

  // Colors
  export const black: Marker = chalk.black;
  export const red: Marker = chalk.red;
  export const green: Marker = chalk.green;
  export const yellow: Marker = chalk.yellow;
  export const blue: Marker = chalk.blue;
  export const magenta: Marker = chalk.magenta;
  export const cyan: Marker = chalk.cyan;
  export const white: Marker = chalk.white;
  export const gray: Marker = chalk.gray;
}

export const mark = Markers;
