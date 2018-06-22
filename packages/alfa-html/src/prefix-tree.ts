/**
 * @internal
 */
export interface PrefixTreeEntry<T> {
  value: T | null;
  readonly children: Array<PrefixTreeEntry<T>>;
}

/**
 * @see https://en.wikipedia.org/wiki/Trie
 *
 * @internal
 */
export class PrefixTree<T> {
  private readonly children: Array<PrefixTreeEntry<T>> = [];

  public get(key: string): T | null {
    return get(this.children, key, 0);
  }

  public set(key: string, value: T): void {
    set(this.children, key, value, 0);
  }

  public has(key: string, prefix: boolean = false): boolean {
    return has(this.children, key, prefix, 0);
  }
}

function get<T>(
  children: Array<PrefixTreeEntry<T>>,
  key: string,
  depth: number
): T | null {
  const char = key.charCodeAt(depth);

  const child = children[char];

  if (child === undefined) {
    return null;
  }

  if (depth === key.length - 1) {
    return child.value;
  }

  return get(child.children, key, depth + 1);
}

function set<T>(
  children: Array<PrefixTreeEntry<T>>,
  key: string,
  value: T,
  depth: number
): void {
  const char = key.charCodeAt(depth);

  let child = children[char];

  if (child === undefined) {
    child = { value: null, children: [] };
    children[char] = child;
  }

  if (depth === key.length - 1) {
    child.value = value;
  } else {
    set(child.children, key, value, depth + 1);
  }
}

function has<T>(
  children: Array<PrefixTreeEntry<T>>,
  key: string,
  prefix: boolean,
  depth: number
): boolean {
  const char = key.charCodeAt(depth);

  const child = children[char];

  if (child === undefined) {
    return false;
  }

  if (depth === key.length - 1) {
    return prefix ? true : child.value !== null;
  }

  return has(child.children, key, prefix, depth + 1);
}
