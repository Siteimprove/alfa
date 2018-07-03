import { Mutable } from "@siteimprove/alfa-util";
import {
  ExtendedLanguageIndex,
  PrimaryLanguageIndex,
  RegionIndex,
  ScriptIndex
} from "./subtags";
import { Language } from "./types";

export function getLanguage(tag: string): Language | null {
  const parts = tag.toLowerCase().split("-");

  // Keep track of the part we're currently looking at.
  let part = 0;

  const primary = PrimaryLanguageIndex.get(parts[part++]);

  if (primary === undefined) {
    return null;
  }

  const language: Mutable<Language> = { primary };

  const extended = ExtendedLanguageIndex.get(parts[part++]);
  if (extended === undefined) {
    part--;
  } else {
    language.extended = extended;
  }

  const script = ScriptIndex.get(parts[part++]);
  if (script === undefined) {
    part--;
  } else {
    language.script = script;
  }

  const region = RegionIndex.get(parts[part++]);
  if (region === undefined) {
    part--;
  } else {
    language.region = region;
  }

  return parts.length === part ? language : null;
}
