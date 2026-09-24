/**
 * Sprint 3: Generational placement ("Lowest Parent" rule).
 *
 * Master Spec §2C: when a person has parents from different generations,
 * they are placed exactly one row below the most recent (lowest/highest-
 * numbered) parent, so the tree always flows forward in time:
 *   generation[child] = max(generation[parent1], generation[parent2]) + 1
 *
 * A person with no parents in the input set is a generational root (0).
 *
 * This module computes generation_index in memory only — it does not
 * write to the database. Persistence is the responsibility of whatever
 * mutation path creates/edits persons; keeping this pure keeps it testable
 * without a DB and independent of Sprint 2's canvas work.
 */

export interface UnionNodeInput {
  id: string;
  partner1Id: string | null;
  partner2Id: string | null;
}

export interface ChildEdgeInput {
  unionNodeId: string;
  childPersonId: string;
}

export interface GenerationInput {
  personIds: string[];
  unionNodes: UnionNodeInput[];
  edges: ChildEdgeInput[];
}

/**
 * Computes generation_index for every person reachable from a root via an
 * acyclic parent -> child chain.
 *
 * Cycles should never occur in valid family tree data, but malformed data
 * must not crash the engine: any person whose generation depends
 * (directly or transitively) on a cycle is simply left out of the
 * returned map rather than throwing.
 */
export function calculateGenerations(
  input: GenerationInput
): Map<string, number> {
  const personIdSet = new Set(input.personIds);
  const unionById = new Map(input.unionNodes.map((u) => [u.id, u]));

  // Flatten union-node child edges into direct parent-person -> child-person
  // edges, since a union node is just a pairing, not a generational entity
  // of its own.
  const childrenOf = new Map<string, string[]>();
  const remainingParents = new Map<string, number>();
  for (const id of input.personIds) {
    childrenOf.set(id, []);
    remainingParents.set(id, 0);
  }

  for (const edge of input.edges) {
    if (!personIdSet.has(edge.childPersonId)) continue;
    const union = unionById.get(edge.unionNodeId);
    if (!union) continue;

    const parentIds = [union.partner1Id, union.partner2Id].filter(
      (id): id is string => id !== null && personIdSet.has(id)
    );

    for (const parentId of parentIds) {
      childrenOf.get(parentId)!.push(edge.childPersonId);
      remainingParents.set(
        edge.childPersonId,
        (remainingParents.get(edge.childPersonId) ?? 0) + 1
      );
    }
  }

  // Kahn's-algorithm-style longest-path pass: a person only enters the
  // queue once every parent contribution to their generation has been
  // applied, so by the time they're dequeued their generation is final.
  const generation = new Map<string, number>();
  const queue: string[] = [];

  for (const id of input.personIds) {
    if (remainingParents.get(id) === 0) {
      generation.set(id, 0);
      queue.push(id);
    }
  }

  const pendingParents = new Map(remainingParents);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentGeneration = generation.get(current)!;

    for (const childId of childrenOf.get(current) ?? []) {
      const candidate = currentGeneration + 1;
      const existing = generation.get(childId);
      if (existing === undefined || candidate > existing) {
        generation.set(childId, candidate);
      }

      const remaining = pendingParents.get(childId)! - 1;
      pendingParents.set(childId, remaining);
      if (remaining === 0) {
        queue.push(childId);
      }
    }
  }

  // Anyone still with unresolved parents at this point is part of (or
  // depends on) a cycle. Leave them out rather than guessing.
  return generation;
}
