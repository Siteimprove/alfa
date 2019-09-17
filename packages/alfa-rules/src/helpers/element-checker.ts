import { getRole, Role } from "@siteimprove/alfa-aria";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  // Element,
  getElementNamespace,
  getInputType,
  InputType,
  isElement,
  Namespace,
  Node
} from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-util";
// import { Predicate } from "@siteimprove/alfa-util";

function emptyOrHas<T>(elt: T, set?: Set<T>) {
  return set === undefined || set.has(elt);
}

export class ElementChecker {
  constructor(namesSet?: Set<string>, inputTypeSet?: Set<InputType>) {
    this.namesSet = namesSet;
    this.inputTypeSet = inputTypeSet;
  }

  public withContext(context: Node): ElementCheckerWithContext {
    return new ElementCheckerWithContext(
      context,
      this.namesSet,
      this.inputTypeSet
    );
  }

  protected namesSet?: Set<string>;
  public withName(...names: Array<string>): ElementChecker {
    this.namesSet = new Set(names);
    return this;
  }

  protected inputTypeSet?: Set<InputType>;
  public withInputType(...inputTypes: Array<InputType>): ElementChecker {
    this.inputTypeSet = new Set(inputTypes);
    return this;
  }

  public build(): (node: Node) => boolean | BrowserSpecific<boolean> {
    return node => this.evaluate(node);
  }

  public evaluate(node: Node): boolean | BrowserSpecific<boolean> {
    if (!isElement(node)) {
      return false;
    }

    return (
      emptyOrHas(node.localName, this.namesSet) &&
      emptyOrHas(getInputType(node), this.inputTypeSet)
    );
  }
}

class ElementCheckerWithContext extends ElementChecker {
  protected readonly context: Node;

  constructor(
    context: Node,
    namesSet?: Set<string>,
    inputTypeSet?: Set<InputType>,
    namespacesSet?: Set<Namespace>
  ) {
    super((namesSet = namesSet), (inputTypeSet = inputTypeSet));
    this.context = context;
    this.namespacesSet = namespacesSet;
  }

  protected namespacesSet?: Set<Namespace>;
  public withNamespace(
    ...namespaces: Array<Namespace>
  ): ElementCheckerWithContext {
    this.namespacesSet = new Set(namespaces);
    return this;
  }

  public withRole(
    device: Device,
    ...roles: Array<Option<Role>>
  ): BrowserSpecificElementChecker {
    return new BrowserSpecificElementChecker(
      this.context,
      device,
      new Set(roles),
      this.namesSet,
      this.inputTypeSet,
      this.namespacesSet
    );
  }

  public evaluate(node: Node): boolean | BrowserSpecific<boolean> {
    if (!isElement(node) || !super.evaluate(node)) {
      return false;
    }

    const elementNamespace = getElementNamespace(node, this.context);
    return (
      elementNamespace !== null &&
      emptyOrHas(elementNamespace, this.namespacesSet)
    );
  }
}

class BrowserSpecificElementChecker extends ElementCheckerWithContext {
  private readonly device: Device;
  private readonly rolesSet: Set<Option<Role>>;

  constructor(
    context: Node,
    device: Device,
    rolesSet: Set<Option<Role>>,
    namesSet?: Set<string>,
    inputTypeSet?: Set<InputType>,
    namespacesSet?: Set<Namespace>
  ) {
    super(
      context,
      (namesSet = namesSet),
      (inputTypeSet = inputTypeSet),
      (namespacesSet = namespacesSet)
    );
    this.device = device;
    this.rolesSet = rolesSet;
  }

  public evaluate(node: Node): boolean | BrowserSpecific<boolean> {
    if (!isElement(node) || !super.evaluate(node)) {
      return false;
    }

    return BrowserSpecific.map(getRole(node, this.context, this.device), role =>
      emptyOrHas(role, this.rolesSet)
    );
  }
}
