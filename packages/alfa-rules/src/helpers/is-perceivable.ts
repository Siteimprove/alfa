import { AnswerType, QuestionType } from "@siteimprove/alfa-act";
import { isExposed } from "@siteimprove/alfa-aria";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { isVisible, Node } from "@siteimprove/alfa-dom";

export function isPerceivable(
  node: AnswerType[QuestionType.Node] | null,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  return (
    node !== false &&
    node !== null &&
    isVisible(node, context, device) &&
    isExposed(node, context, device)
  );
}
