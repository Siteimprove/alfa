import { MarkdownThemeContext } from '../../../theme/index.js';
import { ContainerReflection, ReflectionKind } from 'typedoc';
export declare function groups(this: MarkdownThemeContext, model: ContainerReflection, options: {
    headingLevel: number;
    kind: ReflectionKind;
}): string;
