import { Diagnostic } from "@siteimprove/alfa-act";
import { RGB } from "@siteimprove/alfa-css";
import { Node } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

import * as act from "@siteimprove/alfa-act";

/**
 * @public
 */
export namespace Question {
  /**
   * Maps the `type` parameter of questions to the expected type of the answer.
   */
  interface Type {
    boolean: boolean;
    deprecated: never;
    node: Option<Node>;
    "node[]": Iterable<Node>;
    "color[]": Iterable<RGB>;
    string: string;
  }

  /**
   * @public
   * Maps the `uri` parameter of questions to their `type` parameter and the
   * expected type of answers.
   */
  export type Metadata = {
    [K in Uri]: [Data[K]["type"], Type[Data[K]["type"]]];
  };

  // Since Data is declared `as const`, `typeof Data` is a readonly type with the
  // actual keys as string literal types (rather than the generic string).
  // The intersection with the generic Record ensures that if Data is not
  // correctly filled, Question.of won't properly type.
  type Data = typeof Data &
    Record<
      Uri,
      {
        readonly type: keyof Type;
        readonly message: string;
      }
    >;

  // The list of all registered URIs.
  // It is needed to have it as a separate type to break circularity in building
  // the type Data; but it shouldn't be exported and `keyof Metadata` should be
  // preferred, to keep `Metadata` as the only source of question knowledge.
  type Uri = keyof typeof Data;

  export function of<S, U extends Uri = Uri>(
    uri: U,
    subject: S,
    message?: string,
    diagnostic?: Diagnostic
  ): act.Question<
    Data[U]["type"],
    S,
    S,
    Type[Data[U]["type"]],
    Type[Data[U]["type"]],
    U
  >;

  export function of<S, C, U extends Uri = Uri>(
    uri: U,
    subject: S,
    context: C,
    message?: string,
    diagnostic?: Diagnostic
  ): act.Question<
    Data[U]["type"],
    S,
    C,
    Type[Data[U]["type"]],
    Type[Data[U]["type"]],
    U
  >;

  export function of<S, U extends Uri = Uri>(
    uri: U,
    subject: S,
    contextOrMessage?: S | string,
    messageOrDiagnostic?: string | Diagnostic,
    diagnostic?: Diagnostic
  ): act.Question<
    Data[U]["type"],
    S,
    S,
    Type[Data[U]["type"]],
    Type[Data[U]["type"]],
    U
  > {
    let context: S = subject;
    let message: string;

    if (
      // We assume that no context will be a string.
      // Since contexts are guaranteed to be test targets, this is OK. They are
      // more likely to be text nodes that the actual text in it.
      typeof contextOrMessage === "string"
    ) {
      message = contextOrMessage ?? Data[uri].message;
      // Type is ensured by overloads
      diagnostic = messageOrDiagnostic as Diagnostic;
    } else {
      context = contextOrMessage ?? subject;
      // Type is ensured by overloads
      message = (messageOrDiagnostic as string) ?? Data[uri].message;
    }

    return act.Question.of(
      Data[uri].type,
      uri,
      message,
      subject,
      context,
      diagnostic
    );
  }

  const Data = {
    // R15, R41, R81
    "reference-equivalent-resources": {
      type: "boolean",
      message: `Do the [links/iframe] [resolve to/reference] equivalent resources?`,
    },
    // media rules (R27 [R22, R31], R30 [R23, R29], R35 [R26, R32, R33, R34],
    //              R37 [R25, R31, R36], R38 [R24, R25, R31, R36], R50 [R48, R49])
    "has-audio": {
      // Also used in R50 [R48, R49]
      type: "boolean",
      message: `Does the \`<video>\` element have audio?`,
    },
    "has-audio-track": {
      type: "boolean",
      message: `Does the \`<video>\` element have an audio track that describes its visual information?`,
    },
    "has-captions": {
      type: "boolean",
      message: `Does the \`<video>\` element have captions?`,
    },
    "has-description": {
      type: "boolean",
      message: `Is the visual information of the [audio/video] available through its audio or a separate audio description track?`,
    },
    "is-audio-streaming": {
      type: "boolean",
      message: `Is the \`<audio>\` element streaming?`,
    },
    "is-playing": {
      type: "boolean",
      message: `Is the \`<audio>\` element currently playing?`,
    },
    "is-video-streaming": {
      type: "boolean",
      message: `Is the \`<video>\` element streaming?`,
    },
    label: {
      type: "node",
      message: `Where is the text that labels the [audio/video] element as a video alternative?`,
    },
    "play-button": {
      type: "node",
      message: `Where is the button that controls playback of the \`<audio>\` element?`,
    },
    "text-alternative": {
      type: "node",
      message: `Where is the text alternative of the [audio/video] element?`,
    },
    "track-describes-video": {
      type: "boolean",
      message: `Does at least 1 track describe the visual information of the \`<video>\` element, either in the language of the \`<video>\` element or the language of the page?`,
    },
    transcript: {
      type: "node",
      message: `Where is the transcript of the [audio/video] element?`,
    },
    "transcript-link": {
      type: "node",
      message: `Where is the link pointing to the transcript of the [audio/video]
                  element?`,
    },
    "transcript-perceivable": {
      type: "boolean",
      message: `Is the transcript of the [audio/video] element perceivable?`,
    },
    // R39
    "name-describes-purpose": {
      type: "boolean",
      message: `Does the accessible name of the \`<(target.name]>\` element describe its purpose?`,
    },
    // R50 [R48, R49]
    "audio-control-mechanism": {
      type: "node",
      message: `Where is the mechanism that can pause or stop the audio of the \`<[target.name]>\` element?`,
    },
    "is-above-duration-threshold": {
      type: "boolean",
      message: `Does the \`<[element.name]>\` element have a duration of more than 3 seconds?`,
    },
    "is-below-audio-duration-threshold": {
      type: "boolean",
      message: `Does the \`<[target.name]>\` element have a total audio duration of less than 3 seconds?`,
    },
    // R55
    "is-content-equivalent": {
      type: "boolean",
      message: `Do these [role] landmarks have the same or equivalent content?`,
    },
    // R65
    "has-focus-indicator": {
      type: "boolean",
      message: `Does the element have a visible focus indicator?`,
    },
    // R66, R69
    "background-colors": {
      type: "color[]",
      message: "What are the background colors of the text node?",
    },
    "foreground-colors": {
      type: "color[]",
      message: "What are the foreground colors of the text node?",
    },
    // R87
    "first-tabbable-is-internal-link": {
      type: "boolean",
      message: `Is the first tabbable element of the document an internal link?`,
    },
    "first-tabbable-is-visible": {
      type: "boolean",
      message: `Is the first tabbable element of the document visible if it's focused?`,
    },
    "first-tabbable-reference": {
      type: "node",
      message: `Where in the document does the first tabbable element point?`,
    },
    "first-tabbable-reference-is-main": {
      type: "boolean",
      message: `Does the first tabbable element of the document point to the main content?`,
    },
    // R82 (experimental)
    "error-indicators": {
      type: "node[]",
      message: `Where are (all) the error indicators, if any, for the form field?`,
    },
    "error-indicator-describing-resolution": {
      type: "node",
      message: `Which of these error indicators describes, in text, the cause of the error or how to resolve it?`,
    },
    "error-indicator-identifying-form-field": {
      type: "node",
      message:
        "Which of these error indicators identifies, in text, the form field it relates to?",
    },
    "error-indicator-describes-resolution": {
      type: "deprecated",
      message: `Does the error indicator describe, in text, the cause of the error or how to resolve it?`,
    },
    "error-indicator-identifies-form-field": {
      type: "deprecated",
      message:
        "Does the error indicator identify, in text, the form field it relates to?",
    },
    // ER87 (experimental)
    "internal-reference": {
      type: "node",
      message: `Where in the document does this element point?`,
    },
    "is-start-of-main": {
      type: "boolean",
      message: `Is this element at the start of the main content of the document?`,
    },
    "is-visible-when-focused": {
      type: "boolean",
      message: `Is this element visible when it's focused?`,
    },
    // R109 (experimental)
    "document-language": {
      type: "string",
      message: "What is the main language of the document?",
    },
  } as const;
}
