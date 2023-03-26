import type {OperationNode} from 'kysely'

import {freeze} from '../util/object-utils.js'
import {ElseIfNode} from './else-if-node.js'
import type {SurrealOperationNode} from './operation-node.js'

export interface IfElseQueryNode extends SurrealOperationNode {
  readonly kind: 'IfElseQueryNode'
  readonly if: OperationNode
  readonly then: OperationNode
  readonly else?: OperationNode
  readonly elseIf?: ReadonlyArray<ElseIfNode>
}

/**
 * @internal
 */
export const IfElseQueryNode = freeze({
  is(node: SurrealOperationNode): node is IfElseQueryNode {
    return node.kind === 'IfElseQueryNode'
  },

  create(condition: OperationNode, expression: OperationNode): IfElseQueryNode {
    return freeze({
      kind: 'IfElseQueryNode',
      if: condition,
      then: expression,
    })
  },

  cloneWithElse(ifElseQuery: IfElseQueryNode, elze: OperationNode): IfElseQueryNode {
    return freeze({
      ...ifElseQuery,
      else: elze,
    })
  },

  cloneWithElseIf(ifElseQuery: IfElseQueryNode, condition: OperationNode, expression: OperationNode): IfElseQueryNode {
    const elseIfNode = ElseIfNode.create(condition, expression)

    return freeze({
      ...ifElseQuery,
      elseIf: ifElseQuery.elseIf !== undefined ? [...ifElseQuery.elseIf, elseIfNode] : [elseIfNode],
    })
  },
})
