import { MarkdownThemeContext } from '../../../theme/index.js';
import { DeclarationReflection, ReflectionKind } from 'typedoc';
export declare function typeDeclarationTable(this: MarkdownThemeContext, model: DeclarationReflection[], options: {
    kind?: ReflectionKind;
}): string;
