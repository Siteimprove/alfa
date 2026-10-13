import { ReflectionKind, } from 'typedoc';
const rootsCache = new WeakMap();
export function getHierarchyRoots(project) {
    const cached = rootsCache.get(project);
    if (cached)
        return cached;
    const allClasses = project.getReflectionsByKind(ReflectionKind.ClassOrInterface);
    const roots = allClasses.filter((refl) => {
        if (!refl.implementedBy && !refl.extendedBy) {
            return false;
        }
        if (!refl.implementedTypes && !refl.extendedTypes) {
            return true;
        }
        const types = [
            ...(refl.implementedTypes || []),
            ...(refl.extendedTypes || []),
        ];
        return types.every((type) => !type.visit({
            reference(ref) {
                return ref.reflection !== undefined;
            },
        }));
    });
    const result = roots.sort((a, b) => a.name.localeCompare(b.name));
    rootsCache.set(project, result);
    return result;
}
