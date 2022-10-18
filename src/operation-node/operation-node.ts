export type SurrealOperationNodeKind =
  | 'CreateQueryNode'
  | 'ElseIfNode'
  | 'IfQueryNode'
  | 'RelateQueryNode'
  | 'ReturnNode'

export interface SurrealOperationNode {
  readonly kind: SurrealOperationNodeKind
}

const surrealKindDictionary: Record<SurrealOperationNodeKind, true> = {
  CreateQueryNode: true,
  ElseIfNode: true,
  IfQueryNode: true,
  RelateQueryNode: true,
  ReturnNode: true,
}

export function isSurrealOperationNode(node: {kind: string}): node is SurrealOperationNode {
  return surrealKindDictionary[node.kind as keyof typeof surrealKindDictionary] === true
}
