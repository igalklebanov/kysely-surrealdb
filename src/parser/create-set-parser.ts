import {ColumnNode, ColumnUpdateNode, ValueNode, type InsertObject} from 'kysely'

export type CreateObject<DB, TB extends keyof DB> = InsertObject<DB, TB>

export function parseCreateObject(row: CreateObject<any, any>): ReadonlyArray<ColumnUpdateNode> {
  return Object.entries(row)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => ColumnUpdateNode.create(ColumnNode.create(key), ValueNode.create(value)))
}
