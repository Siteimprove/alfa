import { ReflectionKind, } from 'typedoc';
export function isGroupKind(model) {
    const groupKinds = [
        ReflectionKind.Class,
        ReflectionKind.Interface,
        ReflectionKind.Enum,
        ReflectionKind.Function,
        ReflectionKind.Variable,
        ReflectionKind.TypeAlias,
    ];
    return groupKinds.includes(model.kind);
}
