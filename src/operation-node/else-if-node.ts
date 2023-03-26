import type {FilterNode} from 'kysely'

import {freeze} from '../util/object-utils.js'
import type {ThenNode} from './if-else-query-node.js'
import type {SurrealOperationNode} from './operation-node.js'

export interface ElseIfNode extends SurrealOperationNode {
  readonly kind: 'ElseIfNode'
  readonly if: FilterNode
  readonly then?: ThenNode
}

export const ElseIfNode = freeze({
  is(node: SurrealOperationNode): node is ElseIfNode {
    return node.kind === 'ElseIfNode'
  },

  create(iff: FilterNode): ElseIfNode {
    return freeze({
      kind: 'ElseIfNode',
      if: iff,
    })
  },

  cloneWithThen(elseIf: ElseIfNode, then: ThenNode): ElseIfNode {
    return freeze({
      ...elseIf,
      then,
    })
  },
})