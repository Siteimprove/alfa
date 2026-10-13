import { removeFirstScopedDirectory, toPascalCase, } from '../libs/utils/index.js';
import * as path from 'path';
import { ReflectionKind, Slugger, } from 'typedoc';
import { MarkdownRouter } from './markdown-router.js';
export class ModuleRouter extends MarkdownRouter {
    buildChildPages(reflection, outPages) {
        const kind = this.getPageKind(reflection);
        if (kind) {
            const shouldWritePage = this.shouldWritePage(reflection);
            const idealName = this.getIdealBaseName(reflection);
            const actualName = shouldWritePage
                ? this.getFileName(idealName)
                : `${idealName}${this.extension}`;
            this.fullUrls.set(reflection, actualName);
            if ([
                ReflectionKind.Module,
                ReflectionKind.Namespace,
                ReflectionKind.Document,
            ].includes(reflection.kind)) {
                if (shouldWritePage) {
                    this.sluggers.set(reflection, new Slugger(this.sluggerConfiguration));
                    outPages.push({
                        kind,
                        model: reflection,
                        url: actualName,
                    });
                }
            }
            else {
                this.buildAnchors(reflection, reflection.parent);
            }
            reflection.traverse((child) => {
                this.buildChildPages(child, outPages);
                return true;
            });
        }
        else {
            this.buildAnchors(reflection, reflection.parent);
        }
    }
    getIdealBaseName(reflection) {
        if (this.application.options.getValue('flattenOutputFiles')) {
            return this.getIdealBaseNameFlattened(reflection);
        }
        let dir;
        let fileName;
        switch (reflection.kind) {
            case ReflectionKind.Module: {
                dir = this.getModuleDirectory(reflection);
                fileName = this.getModuleFileName(reflection);
                break;
            }
            case ReflectionKind.Namespace: {
                dir = this.getNamespaceDirectory(reflection);
                fileName = this.getNamespaceFileName(reflection);
                break;
            }
            case ReflectionKind.Document:
                {
                    dir = this.getDocumentDirectory(reflection);
                    fileName = this.getDocumentFileName(reflection);
                }
                break;
            default: {
                dir = this.getReflectionDirectory(reflection);
                fileName = this.getReflectionAlias(reflection);
                break;
            }
        }
        let fullName = path
            .join([dir, fileName].filter((part) => !!part).join('/'))
            .replace(/\\/g, '/')
            .replace(/ /g, '-');
        if (this.ignoreScopes) {
            fullName = removeFirstScopedDirectory(fullName);
        }
        return fullName;
    }
    shouldWritePage(reflection) {
        if (this.isPackages) {
            const meta = this.application.renderer
                ?.packagesMeta[reflection.name];
            const hasEntryModule = meta?.options?.isSet('entryModule') &&
                Boolean(reflection.children?.find((child) => child.name === meta?.options?.getValue('entryModule')));
            if (meta) {
                return !hasEntryModule;
            }
        }
        if (reflection.name === this.entryModule) {
            return false;
        }
        return true;
    }
    moduleHasFolder(reflection) {
        return reflection?.childrenIncludingDocuments?.some((child) => {
            return ([
                ReflectionKind.Namespace,
                ReflectionKind.Document,
                ReflectionKind.Module,
            ].includes(child.kind) || this.hasOwnDocument(child));
        });
    }
    getModuleDirectory(reflection) {
        if (this.isPackages) {
            if (this.getPackageEntryModule(reflection)) {
                return null;
            }
        }
        const hasFolder = this.moduleHasFolder(reflection);
        return hasFolder ? this.getReflectionAlias(reflection) : null;
    }
    getModuleFileName(reflection) {
        const hasFolder = this.moduleHasFolder(reflection);
        if (this.isPackages) {
            const packageEntryModule = this.getPackageEntryModule(reflection);
            if (packageEntryModule) {
                return this.getModuleFileName(packageEntryModule);
            }
        }
        if (reflection.parent?.kind === ReflectionKind.Module) {
            let fileName = this.getReflectionAlias(reflection);
            if (this.isPackages) {
                const meta = this.application.renderer
                    ?.packagesMeta[reflection.parent.name];
                const packageEntryModule = meta?.options?.getValue('entryModule');
                const packageEntryFileName = meta?.options?.getValue('entryFileName');
                if (packageEntryModule === reflection.name) {
                    fileName = packageEntryFileName;
                }
            }
            return `${this.getReflectionAlias(reflection.parent)}/${fileName}`;
        }
        if (reflection.name === this.entryModule) {
            return this.entryFileName;
        }
        if (hasFolder) {
            return this.entryFileName;
        }
        return this.getReflectionAlias(reflection);
    }
    getNamespaceDirectory(reflection) {
        if (reflection.parent) {
            const namespaceRoot = `${this.getIdealBaseName(reflection.parent).replace(/\/[^/]+$/, '')}/${this.directories.get(reflection.kind)}`;
            return this.moduleHasSubfolders(reflection)
                ? `${namespaceRoot}/${this.getReflectionAlias(reflection)}`
                : namespaceRoot;
        }
        else {
            return this.getReflectionAlias(reflection);
        }
    }
    getNamespaceFileName(reflection) {
        return this.moduleHasSubfolders(reflection)
            ? this.entryFileName
            : this.getReflectionAlias(reflection);
    }
    moduleHasSubfolders(reflection) {
        return reflection?.childrenIncludingDocuments?.some((child) => [ReflectionKind.Namespace, ReflectionKind.Document].includes(child.kind));
    }
    getDocumentDirectory(reflection) {
        if (reflection.parent &&
            reflection.parent.kind !== ReflectionKind.Project) {
            return `${this.getIdealBaseName(reflection.parent).replace(/\/[^/]+$/, '')}/${this.directories.get(reflection.kind)}`;
        }
        if (reflection.parent && reflection.parent.kind === ReflectionKind.Module) {
            return `${this.getReflectionAlias(reflection.parent)}/${this.directories.get(reflection.kind)}`;
        }
        return `${this.directories.get(reflection.kind)}`;
    }
    getDocumentFileName(reflection) {
        if (reflection.parent &&
            ![
                ReflectionKind.Project,
                ReflectionKind.Module,
                ReflectionKind.Namespace,
            ].includes(reflection.parent.kind)) {
            return `${toPascalCase(ReflectionKind.singularString(reflection.parent?.kind))}.${this.getReflectionAlias(reflection)}`;
        }
        else {
            return this.getReflectionAlias(reflection);
        }
    }
    getReflectionDirectory(reflection) {
        if (reflection.parent) {
            if (reflection.parent?.kind === ReflectionKind.Namespace) {
                return `${this.getIdealBaseName(reflection.parent).replace(/\/[^/]+$/, '')}`;
            }
            else {
                return `${this.getReflectionAlias(reflection.parent)}`;
            }
        }
        return null;
    }
    getPackageEntryModule(reflection) {
        const meta = this.application.renderer?.packagesMeta[reflection.name];
        if (meta?.options?.isSet('entryModule')) {
            return reflection.children?.find((child) => child.name === meta?.options?.getValue('entryModule'));
        }
        return undefined;
    }
}
