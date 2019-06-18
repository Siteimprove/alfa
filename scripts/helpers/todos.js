const path = require("path");
const prettier = require("prettier");
const TypeScript = require("typescript");

const { readFile, writeFile } = require("./file-system");
const { getLineAtOffset, parseLines } = require("./text");

const { Project } = require("../helpers/project");

/**
 * @typedef {import("./text").Line} Line
 */

/**
 * @typedef {Object} Todo
 * @property {string} file
 * @property {TypeScript.TodoComment} comment
 */

/**
 * @type {Array<TypeScript.TodoCommentDescriptor>}
 */
const checks = [
  { text: "@todo", priority: 1 },
  { text: "@hack", priority: 1 },
  { text: "@bug", priority: 1 },
  { text: "@fixme", priority: 1 }
];

/**
 * @param {string} file
 * @param {Project} project
 * @return {Iterable<Todo>}
 */
function getTodos(file, project) {
  return [...project.getTodos(file, checks)].map(comment => ({
    file,
    comment
  }));
}

exports.getTodos = getTodos;

/**
 * @param {string} file
 * @param {Iterable<Todo>} todos
 */
function writeTodos(file, todos) {
  /**
   * @type {Map<string, Array<string>>}
   */
  const groups = new Map();

  /**
   * @type {Map<string, Line[]>}
   */
  const parsedLines = new Map();
  for (const todo of todos) {
    parsedLines.set(todo.file, parseLines(readFile(todo.file)));
  }

  for (let { file, comment } of todos) {
    const lines = parsedLines.get(file);
    if (lines === undefined) {
      return;
    }

    const line = getLineAtOffset(lines, comment.position).index + 1;

    const message = comment.message.substring(
      comment.descriptor.text.length + 1
    );

    const type = comment.descriptor.text.toLowerCase();

    file = file.split(path.sep).join("/");

    const content = `* [${file}:${line}](${file}#L${line}): ${message}\n`;

    const group = groups.get(type);

    if (group === undefined) {
      groups.set(type, [content]);
    } else {
      group.push(content);
    }
  }

  let content = "";

  for (const [type, todos] of groups) {
    content += `## ${type}\n`;

    for (const todo of todos) {
      content += todo;
    }

    content += "\n";
  }

  content = prettier.format(content, {
    parser: "markdown"
  });

  writeFile(file, content);
}

exports.writeTodos = writeTodos;
