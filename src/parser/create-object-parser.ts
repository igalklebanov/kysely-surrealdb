import {
  ColumnNode,
  ColumnUpdateNode,
  isOperationNodeSource,
  ValueNode,
  type InsertObject,
  type ValueExpressionNode,
} from 'kysely'

export type CreateObject<DB, TB extends keyof DB> = InsertObject<DB, TB>

export function parseSetObject(row: CreateObject<any, any>): ReadonlyArray<ColumnUpdateNode> {
  return Object.entries(row)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => ColumnUpdateNode.create(ColumnNode.create(key), parseSetObjectValue(value)))
}

function parseSetObjectValue(value: unknown): ValueExpressionNode {
  if (isOperationNodeSource(value)) {
    return value.toOperationNode() as any
  }

  // TODO: handle nested raw builders.

  return ValueNode.create(value)
}

export function parseContent(row: CreateObject<any, any>): ValueNode {
  if (isOperationNodeSource(row)) {
    return row.toOperationNode() as any
  }

  // TODO: handle nested raw builders.

  return ValueNode.create(row)
}
