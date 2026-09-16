import { PageDefinition, Reflection } from 'typedoc';
import { MarkdownRouter } from './markdown-router.js';
export declare class MemberRouter extends MarkdownRouter {
    buildChildPages(reflection: Reflection, outPages: PageDefinition[]): void;
    getIdealBaseName(reflection: Reflection): string;
    private shouldWritePage;
    private getModuleDirectory;
    private getModuleFileName;
    private getNamespaceDirectory;
    private getDocumentDirectory;
    private getReflectionDirectory;
    private getReflectionFileName;
    private getPackageEntryModule;
}
