import { ReflectionKind } from 'typedoc';
export function useTableFormat(key, reflectionKind) {
    if (key === 'parameters') {
        return isTable(this.options.getValue('parametersFormat'));
    }
    if (key === 'properties') {
        if (isTable(this.options.getValue('propertiesFormat'))) {
            return true;
        }
        if (reflectionKind === ReflectionKind.TypeAlias) {
            return isTable(this.options.getValue('typeAliasPropertiesFormat'));
        }
        if (reflectionKind === ReflectionKind.Class) {
            return isTable(this.options.getValue('classPropertiesFormat'));
        }
        if (reflectionKind === ReflectionKind.Interface) {
            return isTable(this.options.getValue('interfacePropertiesFormat'));
        }
        return false;
    }
    if (key === 'enums') {
        return isTable(this.options.getValue('enumMembersFormat'));
    }
    if (key === 'propertyMembers') {
        return isTable(this.options.getValue('propertyMembersFormat'));
    }
    if (key === 'typeDeclarations') {
        return isTable(this.options.getValue('typeDeclarationFormat'));
    }
    return false;
}
function isTable(key) {
    return key.toLowerCase().includes('table');
}
