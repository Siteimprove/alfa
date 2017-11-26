export interface Layout {
  readonly top: number
  readonly right: number
  readonly bottom: number
  readonly left: number
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
    top = Math.min(top, layout.top)
    right = Math.min(right, layout.right)
    bottom = Math.min(bottom, layout.bottom)
    left = Math.min(left, layout.left)
  }

  return { top, right, bottom, left }
}

export type LayoutNode = {
  readonly layout: Layout
  readonly children: Array<LayoutNode>
  readonly leaf: boolean
  readonly height: number
}

export class LayoutIndex {
  private readonly max = 9
  private readonly min = 4

  private root: LayoutNode

  constructor (layouts: Array<Layout>) {
    //
  }

  within (target: Layout): Array<Layout> {
    const result: Array<Layout> = []

    if (!intersects(target, this.root.layout)) {
      return result
    }

    const queue: Array<LayoutNode> = []

    for (
      let next: LayoutNode | undefined = this.root;
      next;
      next = queue.pop()
    ) {
      for (const child of next.children) {
        if (!intersects(target, child.layout)) {
          continue
        }

        if (child.leaf) {
          result.push(child.layout)
        } else if (contains(target, child.layout)) {
          for (const leave of leaves(child)) {
            result.push(leave.layout)
          }
        } else {
          queue.push(child)
        }
      }
    }

    return result
  }
}

function * leaves (node: LayoutNode): Iterable<LayoutNode> {
  const queue: Array<LayoutNode> = []

  for (
    let next: LayoutNode | undefined = node;
    next;
    next = queue.pop()
  ) {
    if (next.leaf) {
      yield next
    } else {
      for (const child of next.children) {
        queue.push(child)
      }
    }
  }
}

function partition (nodes: Array<LayoutNode>, start: number = 0, end: number = nodes.length - 1, maximum: number = 0, height: number = 0): LayoutNode {
  const length = end - start + 1

  if (length <= maximum) {
    const children = nodes.slice(start, end + 1)
    return {
      children,
      layout: union(...children.map(child => child.layout)),
      leaf: true,
      height: 1
    }
  }

  if (height === 0) {
    height = Math.ceil(Math.log(length) / Math.log(maximum))
    maximum = Math.ceil(length / Math.pow(maximum, height - 1))
  }

  const node = {
    layout: { top: 0, bottom: 0, right: 0, left: 0 },
    children: [],
    leaf: false,
    height
  }
}
