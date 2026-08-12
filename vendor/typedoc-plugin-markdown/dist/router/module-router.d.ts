import { PageDefinition, Reflection } from 'typedoc';
import { MarkdownRouter } from './markdown-router.js';
export declare class ModuleRouter extends MarkdownRouter {
    buildChildPages(reflection: Reflection, outPages: PageDefinition[]): void;
    getIdealBaseName(reflection: Reflection): string;
    private shouldWritePage;
    private moduleHasFolder;
    private getModuleDirectory;
    private getModuleFileName;
    private getNamespaceDirectory;
    private getNamespaceFileName;
    private moduleHasSubfolders;
    private getDocumentDirectory;
    private getDocumentFileName;
    private getReflectionDirectory;
    private getPackageEntryModule;
}
