export interface Layout {
  readonly left: number
  readonly right: number
  readonly top: number
  readonly bottom: number
}

export function width (layout: Layout): number {
  return layout.right - layout.left
}

export function height (layout: Layout): number {
  return layout.bottom - layout.top
}

export function area (layout: Layout): number {
  return width(layout) * height(layout)
}

export function margin (layout: Layout): number {
  return width(layout) + height(layout)
}

export function intersects (a: Layout, b: Layout): boolean {
  return b.left <= a.right && b.top <= a.bottom && b.right >= a.left && b.bottom >= a.top
}

export function contains (a: Layout, b: Layout): boolean {
  return a.left <= b.left && a.top <= b.top && b.right <= a.right && b.bottom <= a.bottom
}

export function union (...layouts: Layout[]): Layout {
  let top: number = 0
  let right: number = 0
  let bottom: number = 0
  let left: number = 0

  for (const layout of layouts) {
    left = Math.min(left, layout.left)
    right = Math.max(right, layout.right)
    top = Math.min(top, layout.top)
    bottom = Math.max(bottom, layout.bottom)
  }

  return { top, right, bottom, left }
}

export type LayoutNode = Layout & {
  children?: Array<LayoutNode>
  height?: number
}

export class LayoutIndex {
  private readonly _max = 9
  private readonly _min = 4

  private _root: LayoutNode

  constructor (layouts: Array<Layout>) {
    this._root = load(layouts.slice(), 0, this._max)
  }

  within (target: Layout): Array<Layout> {
    const result: Array<Layout> = []

    if (!intersects(target, this._root)) {
      return result
    }

    const queue: Array<LayoutNode> = []

    for (
      let next: LayoutNode | undefined = this._root;
      next;
      next = queue.pop()
    ) {
      if (next.children === undefined) {
        continue
      }

      const { length } = next.children

      for (let i = 0; i < length; i++) {
        const child = next.children[i]

        if (!intersects(target, child)) {
          continue
        }

        if (child.children === undefined) {
          result.push(child)
        } else if (contains(target, child)) {
          leaves(child, result)
        } else {
          queue.push(child)
        }
      }
    }

    return result
  }
}

function leaves (node: LayoutNode, result: Array<LayoutNode>) {
  const queue: Array<LayoutNode> = []

  for (
    let next: LayoutNode | undefined = node;
    next;
    next = queue.pop()
  ) {
    if (next.children === undefined) {
      result.push(next)
    } else {
      const { length } = next.children

      for (let i = 0; i < length; i++) {
        queue.push(next.children[i])
      }
    }
  }
}

/**
 * @see http://ftp.informatik.rwth-aachen.de/Publications/CEUR-WS/Vol-74/files/FORUM_18.pdf
 */
function load (nodes: Array<LayoutNode>, height: number, maximum: number): LayoutNode {
  const { length } = nodes

  if (length <= maximum) {
    return {
      ...union(...nodes),
      children: nodes,
      height: 1
    }
  }

  let subtree = maximum

  if (height === 0) {
    height = Math.ceil(Math.log(length) / Math.log(maximum))
    subtree = Math.ceil(length / Math.pow(maximum, height - 1))
  }

  const children: Array<LayoutNode> = []

  const perGroup = Math.ceil(length / subtree)
  const perSlice = perGroup * Math.ceil(Math.sqrt(subtree))

  nodes.sort((a, b) => a.left - b.left)

  for (let i = 0; i < length; i += perSlice) {
    const sliceEnd = Math.min(i + perSlice - 1, length - 1)
    const slice = nodes.slice(i, sliceEnd + 1)
    const sliceLength = slice.length

    slice.sort((a, b) => a.top - b.top)

    for (let j = 0; j < sliceLength; j += perGroup) {
      const groupEnd = Math.min(j + perGroup - 1, sliceLength - 1)
      const group = slice.slice(j, groupEnd + 1)

      children.push(load(group, height - 1, maximum))
    }
  }

  return { ...union(...children), children, height }
}
