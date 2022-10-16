import type {ColumnUpdateNode, TableNode, ValueNode} from 'kysely'

import type {VertexNode} from '../parser/vertex-expression-parser.js'
import {freeze} from '../util/object-utils.js'
import type {SurrealOperationNode} from './operation-node.js'
import type {ReturnNode} from './return-node.js'

export interface RelateQueryNode extends SurrealOperationNode {
  readonly kind: 'RelateQueryNode'
  readonly from: VertexNode
  readonly relation: TableNode
  readonly to: VertexNode
  readonly content?: ValueNode
  readonly set?: ReadonlyArray<ColumnUpdateNode>
  readonly return?: ReturnNode
}

export const RelateQueryNode = freeze({
  is(node: SurrealOperationNode): node is RelateQueryNode {
    return node.kind === 'RelateQueryNode'
  },

  create(from: VertexNode, relation: TableNode, to: VertexNode): RelateQueryNode {
    return freeze({
      kind: 'RelateQueryNode',
      from,
      relation,
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
