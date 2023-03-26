import type {RawNode, SelectQueryNode, TableNode} from 'kysely'

import {freeze} from '../util/object-utils.js'
import type {SurrealOperationNode} from './operation-node.js'

export type VertexExpressionNode = TableNode | ReadonlyArray<TableNode> | RawNode | SelectQueryNode

export interface VertexNode extends SurrealOperationNode {
  readonly kind: 'VertexNode'
  readonly vertex: VertexExpressionNode
}

/**
 * @internal
 */
export const VertexNode = freeze({
  is(node: SurrealOperationNode): node is VertexNode {
    return node.kind === 'VertexNode'
  },

  create(vertex: VertexExpressionNode): VertexNode {
    return freeze({
      kind: 'VertexNode',
      vertex,
    })
  },
})
