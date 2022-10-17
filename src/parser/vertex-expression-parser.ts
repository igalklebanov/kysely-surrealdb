import {TableNode, type AnySelectQueryBuilder, type RawBuilder, type RawNode, type SelectQueryNode} from 'kysely'

import type {SurrealRecordId} from '../util/surreal-types.js'

export type VertexExpression<DB> = SurrealRecordId<DB> | AnySelectQueryBuilder | RawBuilder<any>

export type VertexNode = TableNode | RawNode | SelectQueryNode

export function parseVertexExpression<DB>(expression: VertexExpression<DB>): VertexNode {
  if (typeof expression === 'string') {
    return TableNode.create(expression)
  }

  return expression.toOperationNode()
}
