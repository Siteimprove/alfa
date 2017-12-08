import SHA from 'jssha'

import { Node } from './types'
import { isElement, isText, isParent, isComment, isDocumentType } from './guards'

const { keys } = Object

/**
 * @see https://www.ietf.org/rfc/rfc2803.txt
 */
export function digest (node: Node): string | null {
  if (isComment(node) || isDocumentType(node)) {
    return null
  }

  const sha = new SHA('SHA-256', 'TEXT')

  sha.update(node.type)

  if (isText(node)) {
    sha.update(node.value)
  }

  if (isElement(node)) {
    sha.update(node.tag)

    for (const name of keys(node.attributes)) {
      const value = node.attributes[name]

      sha.update(name)
      sha.update(String(value))
    }
  }

  if (isParent(node)) {
    for (const child of node.children) {
      const hash = digest(child)

      if (hash) {
        sha.update(hash)
      }
    }
  }

  return sha.getHash('B64')
}
