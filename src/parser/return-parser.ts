import {ColumnNode, type AnyColumn, type SelectType} from 'kysely'

import {ReturnNode, type SurrealReturnType} from '../operation-node/return-node.js'

export type ReturnExpression<DB, TB extends keyof DB> =
  | SurrealReturnType
  | AnyColumn<DB, TB>
  | ReadonlyArray<AnyColumn<DB, TB>>

export type ExtractTypeFromReturnExpression<
  DB,
  TB extends keyof DB,
  RE extends ReturnExpression<DB, TB>,
  O = DB[TB],
> = RE extends 'none'
  ? never
  : RE extends Exclude<SurrealReturnType, 'none'>
  ? O
  : RE extends AnyColumn<DB, TB>
  ? O extends DB[TB]
    ? {[K in RE]: SelectType<ExtractColumnType<DB, TB, RE>>}
    : O & {[K in RE]: SelectType<ExtractColumnType<DB, TB, RE>>}
  : RE extends ReadonlyArray<AnyColumn<DB, TB>>
  ? O extends DB[TB]
    ? {[K in RE[number]]: SelectType<ExtractColumnType<DB, TB, K>>}
    : O & {[K in RE[number]]: SelectType<ExtractColumnType<DB, TB, RE>>}
  : unknown

type ExtractColumnType<DB, TB extends keyof DB, C> = {
  [T in TB]: C extends keyof DB[T] ? DB[T][C] : never
}[TB]

export function parseReturnExpression(expression: ReturnExpression<any, any>): ReturnNode {
  if (isSurrealReturnType(expression)) {
    return ReturnNode.create(expression)
  }

  if (!Array.isArray(expression)) {
    expression = [expression] as ReadonlyArray<string>
  }

  return ReturnNode.create(expression.map(ColumnNode.create))
}

export function isSurrealReturnType(expression: unknown): expression is SurrealReturnType {
  return expression === 'none' || expression === 'before' || expression === 'after' || expression === 'diff'
}
