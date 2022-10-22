import type {ColumnUpdateNode, TableNode, ValueNode} from 'kysely'

import {freeze} from '../util/object-utils.js'
import type {SurrealOperationNode} from './operation-node.js'
import type {ReturnNode} from './return-node.js'
import type {VertexNode} from './vertex-node.js'

export interface RelateQueryNode extends SurrealOperationNode {
  readonly kind: 'RelateQueryNode'
  readonly from?: VertexNode
  readonly edge: TableNode
  readonly to?: VertexNode
  readonly content?: ValueNode
  readonly set?: ReadonlyArray<ColumnUpdateNode>
  readonly return?: ReturnNode
}

export const RelateQueryNode = freeze({
  is(node: SurrealOperationNode): node is RelateQueryNode {
    return node.kind === 'RelateQueryNode'
  },

  create(edge: TableNode): RelateQueryNode {
    return freeze({
      kind: 'RelateQueryNode',
      edge,
    })
  },

  cloneWithFrom(relateQuery: RelateQueryNode, from: VertexNode): RelateQueryNode {
    return freeze({
      ...relateQuery,
      from,
    })
  },

  cloneWithTo(relateQuery: RelateQueryNode, to: VertexNode): RelateQueryNode {
    return freeze({
      ...relateQuery,
      to,
    })
  },

  cloneWithContent(relateQuery: RelateQueryNode, content: ValueNode): RelateQueryNode {
    return freeze({
      ...relateQuery,
      content,
    })
  },

  cloneWithSet(relateQuery: RelateQueryNode, set: ReadonlyArray<ColumnUpdateNode>): RelateQueryNode {
    return freeze({
      ...relateQuery,
      set: relateQuery.set ? freeze([...relateQuery.set, ...set]) : set,
    })
  },

  cloneWithReturn(relateQuery: RelateQueryNode, returnNode: ReturnNode): RelateQueryNode {
    return freeze({
      ...relateQuery,
      return: returnNode,
    })
  },
})
