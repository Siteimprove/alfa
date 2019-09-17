import { getRole, Role } from "@siteimprove/alfa-aria";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  // Element,
  getElementNamespace,
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
  constructor(namesSet?: Set<string>) {
    this.namesSet = namesSet;
  }

  public withContext(context: Node): ElementCheckerWithContext {
    return new ElementCheckerWithContext(context, this.namesSet);
  }

  protected namesSet?: Set<string>;
  public withName(...names: Array<string>): ElementChecker {
    this.namesSet = new Set(names);
    return this;
  }

  public build(): (node: Node) => boolean | BrowserSpecific<boolean> {
    return node => this.evaluate(node);
  }

  public evaluate(node: Node): boolean | BrowserSpecific<boolean> {
    if (!isElement(node)) {
      return false;
    }

    // Checking name, always passing if no names were specified
    return emptyOrHas(node.localName, this.namesSet);
  }
}

class ElementCheckerWithContext extends ElementChecker {
  protected readonly context: Node;

  constructor(
    context: Node,
    namesSet?: Set<string>,
    namespacesSet?: Set<Namespace>
  ) {
    super(namesSet);
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
      this.namespacesSet
    );
  }

  public evaluate(node: Node): boolean | BrowserSpecific<boolean> {
    if (!isElement(node)) {
      return false;
    }

    const elementNamespace = getElementNamespace(node, this.context);

    const simpleChecks = // checks that are not browser Specific
      // Checking name, always passing if no names were specified
      emptyOrHas(node.localName, this.namesSet) &&
      // Checking namespace, always passing if no namespace
      (this.namespacesSet === undefined ||
        (elementNamespace !== null &&
          this.namespacesSet.has(elementNamespace)));

    return simpleChecks;
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
    namespacesSet?: Set<Namespace>
  ) {
    super(context, (namesSet = namesSet), (namespacesSet = namespacesSet));
    this.device = device;
    this.rolesSet = rolesSet;
  }

  public evaluate(node: Node): boolean | BrowserSpecific<boolean> {
    if (!isElement(node)) {
      return false;
    }

    const elementNamespace = getElementNamespace(node, this.context);

    const simpleChecks = // checks that are not browser Specific
      // Checking name, always passing if no names were specified
      emptyOrHas(node.localName, this.namesSet) &&
      // Checking namespace, always passing if no namespace
      (this.namespacesSet === undefined ||
        (elementNamespace !== null &&
          this.namespacesSet.has(elementNamespace)));

    const browserSpecificChecks:
      | boolean
      | BrowserSpecific<boolean> = BrowserSpecific.map(
      getRole(node, this.context, this.device),
      role => emptyOrHas(role, this.rolesSet)
    );

    return simpleChecks ? browserSpecificChecks : simpleChecks;
  }
}
