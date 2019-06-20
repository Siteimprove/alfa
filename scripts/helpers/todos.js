const path = require("path");
const prettier = require("prettier");
const TypeScript = require("typescript");

const { readFile, writeFile } = require("./file-system");
const { getLineAtOffset, parseLines } = require("./text");
const { flatMap, groupBy, map } = require("./iterable");
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
  const todosByFile = groupBy(todos, todo => todo.file);

  const contentByFile = flatMap(todosByFile, ([file, todos]) => {
    const lines = parseLines(readFile(file));
    file = file.split(path.sep).join("/");
    return map(todos, todo => {
      const line = getLineAtOffset(lines, todo.comment.position).index + 1;
      const message = todo.comment.message.substring(
        todo.comment.descriptor.text.length + 1
      );
      const type = todo.comment.descriptor.text.toLowerCase();
      const content = `* [${file}:${line}](${file}#L${line}): ${message}\n`;
      return { type, content };
    });
  });

  const contentByFileGrouped = groupBy(contentByFile, todo => todo.type);

  let content = "";

  for (const [type, todos] of contentByFileGrouped) {
    content += `## ${type}\n`;

    for (const todo of todos) {
      content += todo.content;
    }

    content += "\n";
  }

  content = prettier.format(content, {
    parser: "markdown"
  });

  writeFile(file, content);
}

exports.writeTodos = writeTodos;
