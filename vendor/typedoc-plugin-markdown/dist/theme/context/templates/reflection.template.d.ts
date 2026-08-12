import { MarkdownPageEvent } from '../../../events/index.js';
import { MarkdownThemeContext } from '../../../theme/index.js';
import { DeclarationReflection } from 'typedoc';
export declare function reflection(this: MarkdownThemeContext, page: MarkdownPageEvent<DeclarationReflection>): string;
