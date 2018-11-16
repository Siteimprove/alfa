declare module "magicpen" {
  function magicpen(): magicpen.MagicPen;

  namespace magicpen {
    interface MagicPen {
      /**
       * @see https://github.com/sunesimonsen/magicpen#textcontent-stylestring
       */
      text(content: string, ...style: Array<string>): this;

      /**
       * @see https://github.com/sunesimonsen/magicpen#appendpen-appendfunction
       */
      append(pen: this): this;
      append(fn: (this: this) => void): this;

      /**
       * @see https://github.com/sunesimonsen/magicpen#cloneformat
       */
      clone(): this;

      /**
       * @see https://github.com/sunesimonsen/magicpen#aliases
       */

      space(count: number): this;
      bold(content: string): this;
      dim(content: string): this;
      italic(content: string): this;
      underline(content: string): this;
      inverse(content: string): this;
      hidden(content: string): this;
      strikeThrough(content: string): this;
      black(content: string): this;
      red(content: string): this;
      green(content: string): this;
      yellow(content: string): this;
      blue(content: string): this;
      magenta(content: string): this;
      cyan(content: string): this;
      white(content: string): this;
      gray(content: string): this;

      bgBlack(content: string): this;
      bgRed(content: string): this;
      bgGreen(content: string): this;
      bgYellow(content: string): this;
      bgBlue(content: string): this;
      bgMagenta(content: string): this;
      bgCyan(content: string): this;
      bgWhite(content: string): this;
    }

    interface MagicPenConstructor {
      new (): MagicPen;
      prototype: MagicPen;
    }
  }

  export = magicpen;
}
