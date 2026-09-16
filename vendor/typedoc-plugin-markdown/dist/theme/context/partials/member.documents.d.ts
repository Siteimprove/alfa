import { MarkdownThemeContext } from '../../../theme/index.js';
import { ContainerReflection, DeclarationReflection, ProjectReflection } from 'typedoc';
export declare function documents(this: MarkdownThemeContext, model: ProjectReflection | DeclarationReflection | ContainerReflection, options: {
    headingLevel: number;
}): string;
