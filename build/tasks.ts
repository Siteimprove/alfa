import { Task } from "@foreman/api";
import * as babel from "./tasks/babel";
import * as tap from "./tasks/tap";
import * as typescript from "./tasks/typescript";
import * as locale from "./tasks/locale";

export function tasksFor(path: string): Array<Task> {
  const tasks: Array<Task> = [];

  if (/\.hjson$/.test(path)) {
    tasks.push(locale.transform);
  } else {
    tasks.push(typescript.check);

    if (/spec\.tsx?$/.test(path)) {
      tasks.push(tap.test);
    } else {
      tasks.push(babel.transform);
    }
  }

  return tasks;
}
