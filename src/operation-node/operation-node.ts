export type SurrealOperationNodeKind = 'CreateQueryNode' | 'ReturnNode' | 'RelateQueryNode'

export interface SurrealOperationNode {
  readonly kind: SurrealOperationNodeKind
}

const surrealKindDictionary: Record<SurrealOperationNodeKind, true> = {
  CreateQueryNode: true,
  RelateQueryNode: true,
  ReturnNode: true,
}

export function isSurrealOperationNode(node: {kind: string}): node is SurrealOperationNode {
  return surrealKindDictionary[node.kind as keyof typeof surrealKindDictionary] === true
}
