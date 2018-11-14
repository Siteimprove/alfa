declare module "magicpen" {
  function magicpen(): magicpen.MagicPen;

  namespace magicpen {
    type MagicPen = typeof magicpen;

    /**
     * @see https://github.com/sunesimonsen/magicpen#textcontent-stylestring
     */
    function text(content: string, ...style: Array<string>): MagicPen;

    /**
     * @see https://github.com/sunesimonsen/magicpen#appendpen-appendfunction
     */
    function append(pen: MagicPen): MagicPen;
    function append(fn: (this: MagicPen) => void): MagicPen;

    /**
     * @see https://github.com/sunesimonsen/magicpen#cloneformat
     */
    function clone(): MagicPen;

    /**
     * @see https://github.com/sunesimonsen/magicpen#aliases
     */

    function space(count: number): MagicPen;
    function bold(content: string): MagicPen;
    function dim(content: string): MagicPen;
    function italic(content: string): MagicPen;
    function underline(content: string): MagicPen;
    function inverse(content: string): MagicPen;
    function hidden(content: string): MagicPen;
    function strikeThrough(content: string): MagicPen;
    function black(content: string): MagicPen;
    function red(content: string): MagicPen;
    function green(content: string): MagicPen;
    function yellow(content: string): MagicPen;
    function blue(content: string): MagicPen;
    function magenta(content: string): MagicPen;
    function cyan(content: string): MagicPen;
    function white(content: string): MagicPen;
    function gray(content: string): MagicPen;

    function bgBlack(content: string): MagicPen;
    function bgRed(content: string): MagicPen;
    function bgGreen(content: string): MagicPen;
    function bgYellow(content: string): MagicPen;
    function bgBlue(content: string): MagicPen;
    function bgMagenta(content: string): MagicPen;
    function bgCyan(content: string): MagicPen;
    function bgWhite(content: string): MagicPen;
  }

  export = magicpen;
}
