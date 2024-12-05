/**
 * @internal
 */
export function* stack(error: Error): Iterable<Frame> {
  const frames = error
    .stack!.split("\n")
    .slice(1)
    .map((frame) => frame.trim());

  for (let i = 0, n = frames.length; i < n; i++) {
    const frame = frames[i];

    // If the frame doesn't contain a location reference, skip the frame.
    if (!/(\d+:\d+)/.test(frame)) {
      continue;
    }

    // If the next frame contains a source mapping for the current frame as
    // indicated by an arrow, skip the frame.
    if (i + 1 < n && frames[i + 1].startsWith("->")) {
      continue;
    }

    // Sanitize the frame and split it on colons. This will group the frame into
    // 3 separate parts: The file, the line, and the column.
    const parts = frame
      .replace("(", "")
      .replace(")", "")
      .replace("->", "")
      .split(":")
      .map((part) => part.trim());

    // The part containing the file may contain other things as well that we
    // need to remove so we grab everything from the last space character and
    // cut off the rest.
    parts[0] = parts[0].substring(parts[0].lastIndexOf(" ") + 1);

    const [file, line, column] = parts;

    yield {
      type: file.startsWith("internal") ? "internal" : "user",
      file,
      line: +line,
      column: +column,
    };
  }
}

type Frame = Frame.Native | Frame.Internal | Frame.User;

namespace Frame {
  export interface Native {
    type: "native";
  }

  export interface Internal {
    type: "internal";
    file: string;
    line: number;
    column: number;
  }

  export interface User {
    type: "user";
    file: string;
    line: number;
    column: number;
  }
}
