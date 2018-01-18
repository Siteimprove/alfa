const { codeFrameColumns } = require("@babel/code-frame");

class CodeError extends Error {
  constructor(source, start, end) {
    super();
    this.name = "CodeError";
    this.source = source;
    this.start = start;
    this.end = end;
    this.stack = this.toString();
  }

  toString() {
    const { name, message, source, start, end } = this;

    return codeFrameColumns(
      source,
      { start, end },
      {
        highlightCode: true
      }
    );
  }
}

module.exports = { CodeError };
