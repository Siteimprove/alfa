import { removeFirstScopedDirectory } from '../libs/utils/index.js';
import * as path from 'path';
import { ReflectionKind, Slugger, } from 'typedoc';
import { MarkdownRouter } from './markdown-router.js';
export class MemberRouter extends MarkdownRouter {
    buildChildPages(reflection, outPages) {
        const kind = this.getPageKind(reflection);
        if (kind) {
            const shouldWritePage = this.shouldWritePage(reflection);
            const idealName = this.getIdealBaseName(reflection);
            const actualName = shouldWritePage
                ? this.getFileName(idealName)
                : `${idealName}${this.extension}`;
            this.fullUrls.set(reflection, actualName);
            // Note: The concept of "membersWithOwnFile" is being deprecated in favour of custom router implementations.
            if ([
                'Module',
                'Namespace',
                'Document',
                ...this.membersWithOwnFile,
            ].includes(this.kindsToString.get(reflection.kind))) {
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
            case ReflectionKind.Module:
                dir = this.getModuleDirectory(reflection);
                fileName = this.getModuleFileName(reflection);
                break;
            case ReflectionKind.Namespace:
                dir = this.getNamespaceDirectory(reflection);
                fileName = this.entryFileName;
                break;
            case ReflectionKind.Document:
                dir = this.getDocumentDirectory(reflection);
                fileName = this.getReflectionAlias(reflection);
                break;
            default:
                dir = this.getReflectionDirectory(reflection);
                fileName = this.getReflectionFileName(reflection);
                break;
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
    getModuleDirectory(reflection) {
        if (this.entryModule && reflection.name === this.entryModule) {
            return null;
        }
        if (reflection.parent?.kind === ReflectionKind.Module) {
            if (this.isPackages) {
                const meta = this.application.renderer
                    ?.packagesMeta[reflection.parent.name];
                const packageEntryModule = meta?.options?.getValue('entryModule');
                if (packageEntryModule === reflection.name) {
                    return this.getReflectionAlias(reflection.parent);
                }
            }
            return `${this.getReflectionAlias(reflection.parent)}/${this.getReflectionAlias(reflection)}`;
        }
        return this.getReflectionAlias(reflection);
    }
    getModuleFileName(reflection) {
        if (this.isPackages) {
            const packageEntryModule = this.getPackageEntryModule(reflection);
            if (packageEntryModule) {
                return this.getModuleFileName(packageEntryModule);
            }
        }
        if (reflection.parent?.kind === ReflectionKind.Module) {
            if (this.isPackages) {
                const meta = this.application.renderer
                    ?.packagesMeta[reflection.parent.name];
                const packageEntryModule = meta?.options?.getValue('entryModule');
                const packageEntryFileName = meta?.options?.getValue('entryFileName');
                if (packageEntryModule === reflection.name) {
                    return packageEntryFileName;
                }
            }
        }
        return this.entryFileName;
    }
    getNamespaceDirectory(reflection) {
        if (reflection.parent) {
            return `${this.getIdealBaseName(reflection.parent).replace(/\/[^/]+$/, '')}/${this.directories.get(reflection.kind)}/${this.getReflectionAlias(reflection)}`;
        }
        return this.getReflectionAlias(reflection);
    }
    getDocumentDirectory(reflection) {
        if (reflection.parent &&
            reflection.parent.kind !== ReflectionKind.Project) {
            return `${this.getIdealBaseName(reflection.parent).replace(/\/[^/]+$/, '')}/${this.directories.get(reflection.kind)}`;
        }
        return `${this.directories.get(reflection.kind)}`;
    }
    getReflectionDirectory(reflection) {
        if (reflection.parent) {
            if (reflection.parent?.kind === ReflectionKind.Namespace) {
                return `${this.getIdealBaseName(reflection.parent).replace(/\/[^/]+$/, '')}/${this.directories.get(reflection.kind)}`;
            }
            if (reflection.parent?.kind === ReflectionKind.Module) {
                if (this.entryModule && reflection.parent.name === this.entryModule) {
                    return `${this.getReflectionAlias(reflection.parent)}/${this.directories.get(reflection.kind)}`;
                }
                if (this.isPackages) {
                    if (reflection?.parent?.parent) {
                        const meta = this.application.renderer
                            ?.packagesMeta[reflection.parent.parent.name];
                        const packageEntryModule = meta?.options?.getValue('entryModule');
                        if (packageEntryModule === reflection.parent?.name) {
                            return `${this.getReflectionAlias(reflection.parent.parent)}/${this.getReflectionAlias(reflection.parent)}/${this.directories.get(reflection.kind)}`;
                        }
                    }
                }
                return `${this.getIdealBaseName(reflection.parent).replace(/\/[^/]+$/, '')}/${this.directories.get(reflection.kind)}`;
            }
            if (reflection.parent?.kind === ReflectionKind.Project) {
                return `${this.directories.get(reflection.kind)}`;
            }
            return `${this.getReflectionAlias(reflection.parent)}/${this.directories.get(reflection.kind)}`;
        }
        return '';
    }
    getReflectionFileName(reflection) {
        return this.getReflectionAlias(reflection);
    }
    getPackageEntryModule(reflection) {
        const meta = this.application.renderer?.packagesMeta[reflection.name];
        if (meta?.options?.isSet('entryModule')) {
            return reflection.children?.find((child) => child.name === meta?.options?.getValue('entryModule'));
        }
        return undefined;
    }
}
