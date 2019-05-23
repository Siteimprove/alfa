import { Locale } from "@siteimprove/alfa-act";

export const EN: Locale = {
  id: "en",
  title: "Video has captions",
  expectations: {
    1: {
      passed: data => "The video element has captions",
      failed: data => "The video element must have captions"
    }
  },
  questions: {
    "is-streaming": "Is the video live and not prerecorded?",
    "has-audio": "Does the video have audio?",
    "has-captions":
      "Does the video have captions that convey the audio information of the video that is not conveyed visually?"
  }
};
