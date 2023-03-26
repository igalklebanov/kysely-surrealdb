import type {ColumnUpdateNode, TableNode, ValueNode} from 'kysely'

import {freeze} from '../util/object-utils.js'
import type {SurrealOperationNode} from './operation-node.js'
import type {ReturnNode} from './return-node.js'

export interface CreateQueryNode extends SurrealOperationNode {
  readonly kind: 'CreateQueryNode'
  readonly target: TableNode
  readonly content?: ValueNode
  readonly set?: ReadonlyArray<ColumnUpdateNode>
  readonly return?: ReturnNode
}

/**
 * @internal
 */
export const CreateQueryNode = freeze({
  is(node: SurrealOperationNode): node is CreateQueryNode {
    return node.kind === 'CreateQueryNode'
  },

  create(target: TableNode): CreateQueryNode {
    return freeze({
      kind: 'CreateQueryNode',
      target,
    })
  },

  cloneWithContent(createQuery: CreateQueryNode, content: ValueNode): CreateQueryNode {
    return freeze({
      ...createQuery,
      content,
    })
  },

  cloneWithSet(createQuery: CreateQueryNode, set: ReadonlyArray<ColumnUpdateNode>): CreateQueryNode {
    return freeze({
      ...createQuery,
      set: createQuery.set ? freeze([...createQuery.set, ...set]) : set,
    })
  },

  cloneWithReturn(createQuery: CreateQueryNode, returnNode: ReturnNode): CreateQueryNode {
    return freeze({
      ...createQuery,
      return: returnNode,
    })
  },
})
