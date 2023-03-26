import {TableNode, type AnySelectQueryBuilder, type RawBuilder} from 'kysely'

import {VertexNode} from '../operation-node/vertex-node.js'
import {isReadonlyArray} from '../util/object-utils.js'
import type {AnySpecificVertex} from '../util/surreal-types.js'

export type VertexExpression<DB> =
  | AnySpecificVertex<DB>
  | ReadonlyArray<AnySpecificVertex<DB>>
  | AnySelectQueryBuilder
  | RawBuilder<any>

export function parseVertexExpression<DB>(expression: VertexExpression<DB>): VertexNode {
  if (typeof expression === 'string') {
    return VertexNode.create(TableNode.create(expression))
  }

  if (isReadonlyArray(expression)) {
    return VertexNode.create(expression.map(TableNode.create))
  }

  return VertexNode.create(expression.toOperationNode())
}
