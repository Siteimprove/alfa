import { Element } from '../types'
import { attribute } from './attribute'

export function classlist (element: Element): Set<string> {
  const classes = attribute(element, 'class')

  return new Set(
    classes === undefined ? [] : classes.split(/\s+/)
  )
}
