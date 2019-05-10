import { FunctionMap } from "./function";
import { Value } from "./types";

export interface Environment {
  readonly focus: Focus;
  readonly functions: FunctionMap;
}

export interface Focus {
  readonly item: Value;
  readonly position: number;
  readonly size: number;
}

export function withFocus(environment: Environment, focus: Focus): Environment {
  return { ...environment, focus };
}
