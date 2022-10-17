import {
  ColumnNode,
  ColumnUpdateNode,
  isOperationNodeSource,
  ValueNode,
  type InsertObject,
  type ValueExpressionNode,
} from 'kysely'

export type CreateObject<DB, TB extends keyof DB> = InsertObject<DB, TB>

export function parseCreateObject(row: CreateObject<any, any>): ReadonlyArray<ColumnUpdateNode> {
  return Object.entries(row)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => ColumnUpdateNode.create(ColumnNode.create(key), parseCreateObjectValue(value)))
}

function parseCreateObjectValue(value: unknown): ValueExpressionNode {
  if (isOperationNodeSource(value)) {
    return value.toOperationNode() as any
  }

  return ValueNode.create(value)
}
