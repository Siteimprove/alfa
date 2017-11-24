const { keys } = Object

export type State = 'default' | 'focus'

export enum PropertyName {
  'display',
  'visibility',
  'color',
  'font-size',
  'text-indent',
  'background-color',
  'background-image'
}

export type Property = keyof typeof PropertyName

export type Style = {
  [P in Property]?: string
}

export const properties: Array<Property> = []

for (const name in keys(PropertyName)) {
  const property = PropertyName[name]

  if (property !== undefined) {
    properties[name] = property as Property
  }
}

export function deduplicate (base: Style, target: Style): Style {
  const deduplicated: Style = {}

  for (const property of properties) {
    const value = target[property]

    if (property in target && base[property] !== value) {
      deduplicated[property] = value
    }
  }

  return deduplicated
}

export function clean (style: Style): Style {
  const cleaned: Style = {}

  for (const property of properties) {
    switch (property) {
      case 'background-image':
        if (style[property] === 'none') {
          continue
        } break

      case 'background-color':
        if (style[property] === 'rgba(0, 0, 0, 0)') {
          continue
        } break
    }

    cleaned[property] = style[property]
  }

  return cleaned
}
