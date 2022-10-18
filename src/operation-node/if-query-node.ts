import type {FilterNode, RootOperationNode, ValueNode} from 'kysely'

import {freeze} from '../util/object-utils.js'
import type {ElseIfNode} from './else-if-node.js'
import type {SurrealOperationNode} from './operation-node.js'

export interface IfQueryNode extends SurrealOperationNode {
  readonly kind: 'IfQueryNode'
  readonly if: FilterNode
  readonly then?: ValueNode | RootOperationNode | SurrealOperationNode
  readonly else?: ValueNode | RootOperationNode | SurrealOperationNode
  readonly elseIf?: ReadonlyArray<ElseIfNode>
}

export const IfQueryNode = freeze({
  is(node: SurrealOperationNode): node is IfQueryNode {
    return node.kind === 'IfQueryNode'
  },

  create(iff: FilterNode): IfQueryNode {
    return freeze({
      kind: 'IfQueryNode',
      if: iff,
    })
  },

  cloneWithThen(ifQuery: IfQueryNode, then: ValueNode | RootOperationNode | SurrealOperationNode): IfQueryNode {
    return freeze({
      ...ifQuery,
      then,
    })
  },

  cloneWithElse(ifQuery: IfQueryNode, elze: ValueNode | RootOperationNode | SurrealOperationNode): IfQueryNode {
    return freeze({
      ...ifQuery,
      else: elze,
    })
  },

  cloneWithElseIf(ifQuery: IfQueryNode, elseIf: ElseIfNode): IfQueryNode {
    return freeze({
      ...ifQuery,
      elseIf: ifQuery.elseIf !== undefined ? [...ifQuery.elseIf, elseIf] : [elseIf],
    })
  },
})
