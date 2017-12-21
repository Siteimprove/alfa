import { Element } from '../types'
import { attribute } from './attribute'

const whitespace = /\s+/

export function classlist (element: Element): Set<string> {
  const classes = attribute(element, 'class')

  return new Set(
    classes === undefined ? [] : classes.split(whitespace)
  )
}
