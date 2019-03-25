import { Locale } from "@siteimprove/alfa-act";

export const EN: Locale = {
  id: "en",
  title: "Audio has a transcript",
  expectations: {
    1: {
      passed: data => "The audio element has a text transcript",
      failed: data => "The audio element must have a text transcript"
    }
  },
  questions: {
    "is-streaming": "Is the audio live and not prerecorded?",
    "is-playing": "Is the audio currently playing?",
    "play-button": "Locate the button that when activated plays the audio",
    "has-transcript":
      "Is the audio information available through a text transcript?"
  }
};
