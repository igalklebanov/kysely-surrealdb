import type {ColumnNode} from 'kysely'

import {freeze} from '../util/object-utils.js'
import type {SurrealOperationNode} from './operation-node.js'

export type SurrealReturnType = 'none' | 'before' | 'after' | 'diff'

export interface ReturnNode extends SurrealOperationNode {
  readonly kind: 'ReturnNode'
  readonly return: SurrealReturnType | ReadonlyArray<ColumnNode>
}

/**
 * @internal
 */
export const ReturnNode = freeze({
  is(node: SurrealOperationNode): node is ReturnNode {
    return node.kind === 'ReturnNode'
  },

  create(returned: SurrealReturnType | ReadonlyArray<ColumnNode>): ReturnNode {
    return freeze({
      kind: 'ReturnNode',
      return: returned,
    })
  },
})
