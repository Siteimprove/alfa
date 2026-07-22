import { MarkdownThemeContext } from '../../../theme/index.js';
import { DeclarationReflection, ReflectionKind } from 'typedoc';
/**
 * Renders a collection of properties in a table.
 *
 * There is no association list partial for properties as these are handled as a standard list of members.
 */
export declare function propertiesTable(this: MarkdownThemeContext, model: DeclarationReflection[], options?: {
    isEventProps: boolean;
    kind: ReflectionKind;
}): string;
