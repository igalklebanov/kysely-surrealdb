export type SurrealOperationNodeKind =
  | 'CreateQueryNode'
  | 'ElseIfNode'
  | 'IfElseQueryNode'
  | 'RelateQueryNode'
  | 'ReturnNode'
  | 'VertexNode'

export interface SurrealOperationNode {
  readonly kind: SurrealOperationNodeKind
}

const surrealKindDictionary: Record<SurrealOperationNodeKind, true> = {
  CreateQueryNode: true,
  ElseIfNode: true,
  IfElseQueryNode: true,
  RelateQueryNode: true,
  ReturnNode: true,
  VertexNode: true,
}

export function isSurrealOperationNode(node: {kind: string}): node is SurrealOperationNode {
  return surrealKindDictionary[node.kind as keyof typeof surrealKindDictionary] === true
}
