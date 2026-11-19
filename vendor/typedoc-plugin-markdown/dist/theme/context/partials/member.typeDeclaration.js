import { ReflectionKind } from 'typedoc';
export function typeDeclaration(model, options) {
    const md = [];
    const shouldDisplayTable = () => {
        if (model.parent?.kind === ReflectionKind.Property &&
            this.helpers.useTableFormat('propertyMembers')) {
            return true;
        }
        if (model.parent?.kind !== ReflectionKind.Property &&
            this.helpers.useTableFormat('typeDeclarations')) {
            return true;
        }
        return false;
    };
    if (shouldDisplayTable()) {
        md.push(this.partials.typeDeclarationTable(model.children || [], {
            kind: model.parent?.kind,
        }));
    }
    else {
        md.push(this.partials.typeDeclarationList(model.children || [], options));
    }
    return md.join('\n\n');
}
