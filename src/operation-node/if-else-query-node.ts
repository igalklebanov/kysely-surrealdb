import type {BinaryOperationNode, RootOperationNode, ValueNode} from 'kysely'

import {freeze} from '../util/object-utils.js'
import type {ElseIfNode} from './else-if-node.js'
import type {SurrealOperationNode} from './operation-node.js'

export type ThenNode = ValueNode | RootOperationNode | SurrealOperationNode

export interface IfElseQueryNode extends SurrealOperationNode {
  readonly kind: 'IfElseQueryNode'
  readonly if: BinaryOperationNode
  readonly then?: ThenNode
  readonly else?: ThenNode
  readonly elseIf?: ReadonlyArray<ElseIfNode>
}

export const IfElseQueryNode = freeze({
  is(node: SurrealOperationNode): node is IfElseQueryNode {
    return node.kind === 'IfElseQueryNode'
  },

  create(iff: BinaryOperationNode): IfElseQueryNode {
    return freeze({
      kind: 'IfElseQueryNode',
      if: iff,
    })
  },

  cloneWithThen(ifElseQuery: IfElseQueryNode, then: ThenNode): IfElseQueryNode {
    return freeze({
      ...ifElseQuery,
      then,
    })
  },

  cloneWithElse(ifElseQuery: IfElseQueryNode, elze: ThenNode): IfElseQueryNode {
    return freeze({
      ...ifElseQuery,
      else: elze,
    })
  },

  cloneWithElseIf(ifElseQuery: IfElseQueryNode, elseIf: ElseIfNode): IfElseQueryNode {
    return freeze({
      ...ifElseQuery,
      elseIf: ifElseQuery.elseIf !== undefined ? [...ifElseQuery.elseIf, elseIf] : [elseIf],
    })
  },
})
