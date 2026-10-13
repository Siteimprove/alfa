var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { getPathWithoutExt } from '../libs/utils/index.js';
import { CategoryRouter as CoreCategoryRouter, GroupRouter as CoreGroupRouter, KindRouter as CoreKindRouter, StructureRouter as CoreStructureRouter, } from 'typedoc';
/**
 * The core routers of TypeDoc are decorated to handle file options of the plugin.
 */
let KindRouter = class KindRouter extends CoreKindRouter {
};
KindRouter = __decorate([
    CoreRouter
], KindRouter);
export { KindRouter };
let KindDirRouter = class KindDirRouter extends KindRouter {
};
KindDirRouter = __decorate([
    CoreRouter,
    CoreDirRouter
], KindDirRouter);
export { KindDirRouter };
let StructureRouter = class StructureRouter extends CoreStructureRouter {
};
StructureRouter = __decorate([
    CoreRouter
], StructureRouter);
export { StructureRouter };
let StructureDirRouter = class StructureDirRouter extends StructureRouter {
};
StructureDirRouter = __decorate([
    CoreRouter,
    CoreDirRouter
], StructureDirRouter);
export { StructureDirRouter };
let GroupRouter = class GroupRouter extends CoreGroupRouter {
};
GroupRouter = __decorate([
    CoreRouter
], GroupRouter);
export { GroupRouter };
let CategoryRouter = class CategoryRouter extends CoreCategoryRouter {
};
CategoryRouter = __decorate([
    CoreRouter
], CategoryRouter);
export { CategoryRouter };
/**
 * This decorator is used to amend the core routers to handle options of the plugin.
 */
function CoreRouter(constructor) {
    return class extends constructor {
        options = this.application.options;
        anchorPrefix = this.options.getValue('anchorPrefix');
        mergeReadme = this.options.getValue('mergeReadme');
        entryFileName = getPathWithoutExt(this.options.getValue('entryFileName'));
        modulesFileName = getPathWithoutExt(this.options.getValue('modulesFileName'));
        /**
         * Set "includeHierarchySummary" option to false as default.
         */
        includeHierarchySummary = this.options.isSet('includeHierarchySummary') &&
            this.options.getValue('includeHierarchySummary');
        /**
         * Expose the "fileExtension" option to the extension property.
         */
        extension = this.options.getValue('fileExtension');
        /**
         * Intercepts getFileName method to handle file options.
         * - Maps "index" baseName to "entryFileName".
         * - Maps "modules" baseName with "mergeReadme" to "entryFileName".
         * - Maps "modules" baseName to "modulesFileName".
         * - Otherwise, delegates to super.
         * -
         */
        getFileName(baseName) {
            if (baseName === 'index') {
                return super.getFileName(this.entryFileName);
            }
            if (baseName === 'modules' && this.mergeReadme) {
                return `${this.entryFileName}${this.extension}`;
            }
            if (baseName === 'modules' && this.options.isSet('modulesFileName')) {
                return super.getFileName(this.modulesFileName);
            }
            return super.getFileName(baseName);
        }
        getAnchor(target) {
            if (this.anchorPrefix) {
                return `${this.anchorPrefix}${super.getAnchor(target)}`;
            }
            return super.getAnchor(target);
        }
    };
}
function CoreDirRouter(constructor) {
    return class extends constructor {
        indexName = getPathWithoutExt(this.application.options.getValue('entryFileName'));
        buildChildPages(reflection, outPages) {
            this.extension = `/${this.indexName}${this.application.options.getValue('fileExtension')}`;
            return super.buildChildPages(reflection, outPages);
        }
    };
}
