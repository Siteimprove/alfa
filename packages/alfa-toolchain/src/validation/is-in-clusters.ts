type Cluster = string | { name: string; children: Array<Cluster> };

/**
 * @internal
 */
export function isInClusters(
  names: Array<string>,
  clusters: Array<Cluster>,
  filePath: string,
): Array<string> {
  const errors: Array<string> = [];

  function search(name: string, clusters: Array<Cluster>): boolean {
    return clusters.some((cluster) =>
      typeof cluster === "string"
        ? cluster === name
        : search(name, cluster.children),
    );
  }

  for (const name of names) {
    if (!search(name, clusters)) {
      errors.push(
        `Name "${name}" is not in any cluster defined in ${filePath}`,
      );
    }
  }

  return errors;
}
