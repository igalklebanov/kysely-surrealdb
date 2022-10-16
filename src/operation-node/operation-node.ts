export type SurrealOperationNodeKind = 'CreateQueryNode' | 'ReturnNode'

export interface SurrealOperationNode {
  readonly kind: SurrealOperationNodeKind
}

export function isSurrealOperationNode(node: {kind: string}): node is SurrealOperationNode {
  return node.kind === 'CreateQueryNode' || node.kind === 'ReturnNode'
}
