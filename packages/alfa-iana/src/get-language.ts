import { Char, isAlpha, isNumeric, Stream } from "@siteimprove/alfa-lang";
import { None, Option } from "@siteimprove/alfa-option";

import {
  ExtendedLanguageIndex,
  PrimaryLanguageIndex,
  RegionIndex,
  ScriptIndex
} from "./subtags";
import { ExtendedLanguage, Language, Region, Script } from "./types";

const { assign } = Object;
const { fromCharCode } = String;

/**
 * @internal
 */
export function getLanguage(tag: string): Option<Language> {
  tag = tag.toLowerCase();

  const stream = new Stream(tag.length, i => tag.charCodeAt(i));

  const language: Language | null = getPrimaryLanguage(stream);

  if (language === null) {
    return None;
  }

  if (stream.peek(0) === Char.HyphenMinus) {
    stream.advance(1);

    const script = getScript(stream);

    if (script === null) {
      stream.backup(1);
    } else if (script !== false) {
      assign(language, { script });
    }
  }

  if (stream.peek(0) === Char.HyphenMinus) {
    stream.advance(1);

    const region = getRegion(stream);

    if (region === null) {
      stream.backup(1);
    } else if (region !== false) {
      assign(language, { region });
    }
  }

  if (!stream.done()) {
    return None;
  }

  return Option.of(language);
}

function getPrimaryLanguage(stream: Stream<number>): Language | null {
  const tokens: Array<number> = [];

  if (stream.accept(isAlpha, tokens)) {
    const primary = PrimaryLanguageIndex.get(fromCharCode(...tokens));

    if (primary === undefined) {
      return null;
    }

    if (tokens.length === 2 || tokens.length === 3) {
      if (stream.peek(0) === Char.HyphenMinus) {
        stream.advance(1);

        const extended = getExtentedLanguage(stream);

        if (extended === null) {
          stream.backup(1);
        } else {
          return extended === false ? { primary } : { primary, extended };
        }
      }

      return { primary };
    }

    if (tokens.length === 4) {
      return { primary };
    }

    if (tokens.length >= 5 && tokens.length <= 8) {
      return { primary };
    }
  }

  return null;
}

function getExtentedLanguage(
  stream: Stream<number>
): ExtendedLanguage | false | null {
  const tokens: Array<number> = [];

  if (stream.accept(isAlpha, tokens) && tokens.length === 3) {
    for (let i = 0, n = 2; i < n; i++) {
      if (stream.peek(0) === Char.HyphenMinus) {
        stream.advance(1);

        const tokens: Array<number> = [];

        if (stream.accept(isAlpha, tokens) && tokens.length === 3) {
          continue;
        } else {
          stream.backup(1 + tokens.length);
        }
      }

      break;
    }

    const extended = ExtendedLanguageIndex.get(fromCharCode(...tokens));

    return extended === undefined ? false : extended;
  }

  stream.backup(tokens.length);

  return null;
}

function getScript(stream: Stream<number>): Script | false | null {
  const tokens: Array<number> = [];

  if (stream.accept(isAlpha, tokens) && tokens.length === 4) {
    const script = ScriptIndex.get(fromCharCode(...tokens));

    return script === undefined ? false : script;
  }

  stream.backup(tokens.length);

  return null;
}

function getRegion(stream: Stream<number>): Region | false | null {
  let tokens: Array<number> = [];

  if (stream.accept(isAlpha, tokens) && tokens.length === 2) {
    const region = RegionIndex.get(fromCharCode(...tokens));

    return region === undefined ? false : region;
  }

  stream.backup(tokens.length);

  tokens = [];

  if (stream.accept(isNumeric, tokens) && tokens.length === 3) {
    const region = RegionIndex.get(fromCharCode(...tokens));

    return region === undefined ? false : region;
  }

  stream.backup(tokens.length);

  return null;
}
