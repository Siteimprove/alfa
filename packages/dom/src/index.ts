export * from './collect'
export * from './compare'
export * from './guards'
export * from './traverse'
export * from './types'

export function attribute (
  element: Element,
  name: string,
  opts: {
    trim: boolean
  } = {
    trim: false
  }
) {
  const { attributes } = element

  if (!(name in attributes)) {
    return null
  }

  const value = attributes[name]

  if (typeof value === 'string' && opts.trim) {
    return value.trim()
  }

  return value
}
