import type {OperationNode} from 'kysely'

import {freeze} from '../util/object-utils.js'
import type {SurrealOperationNode} from './operation-node.js'

export interface ElseIfNode extends SurrealOperationNode {
  readonly kind: 'ElseIfNode'
  readonly if: OperationNode
  readonly then: OperationNode
}

/**
 * @internal
 */
export const ElseIfNode = freeze({
  is(node: SurrealOperationNode): node is ElseIfNode {
    return node.kind === 'ElseIfNode'
  },

  create(condition: OperationNode, expression: OperationNode): ElseIfNode {
    return freeze({
      kind: 'ElseIfNode',
      if: condition,
      then: expression,
    })
  },
})
