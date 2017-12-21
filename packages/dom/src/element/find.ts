import { Node, Element } from '../types'
import { isElement } from '../guards'
import { collect } from '../collect'
import { matches } from './matches'

export function find (context: Node, selector: string): Element | null {
  return collect(context).where(isElement).where(element => matches(element, selector)).first()
}

export function findAll (context: Node, selector: string): Iterable<Element> {
  return collect(context).where(isElement).where(element => matches(element, selector))
}
