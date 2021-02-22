import React, { FunctionComponent } from "react";

import * as ink from "ink";

export const Prompt: FunctionComponent<Prompt.Props> = ({
  message,
  onSelect,
}) => (
  <ink.Box>
    <ink.Box marginRight={1}>
      <ink.Text>{message}</ink.Text>
    </ink.Box>

    <Choice label="Yes" focus={true} onSelect={() => onSelect?.(true)} />

    <ink.Box marginX={1}>
      <ink.Text>&middot;</ink.Text>
    </ink.Box>

    <Choice label="No" onSelect={() => onSelect?.(false)} />
  </ink.Box>
);

export namespace Prompt {
  export interface Props {
    message: string;
    onSelect?: (answer: boolean) => void;
  }
}

const Choice: FunctionComponent<Choice.Props> = ({
  label,
  focus,
  onSelect,
}) => {
  const { isFocused } = ink.useFocus({
    autoFocus: focus,
  });

  ink.useInput((input, key) => {
    if (isFocused && key.return) {
      onSelect?.();
    }
  });

  return (
    <ink.Text underline={isFocused} color={isFocused ? "cyan" : undefined}>
      {label}
    </ink.Text>
  );
};

namespace Choice {
  export interface Props {
    label: string;
    focus?: boolean;
    onSelect?: () => void;
  }
}
