import {Kysely, TableNode} from 'kysely'

import {CreateQueryNode} from './operation-node/create-query-node.js'
import {RelateQueryNode} from './operation-node/relate-query-node.js'
import {parseVertexExpression, type VertexExpression} from './parser/vertex-expression-parser.js'
import {CreateQueryBuilder} from './query-builder/create-query-builder.js'
import {RelateQueryBuilder} from './query-builder/relate-query-builder.js'
import {createQueryId} from './util/query-id.js'
import type {SurrealDatabase, SurrealRecordId} from './util/surreal-types.js'

export class SurrealKysely<DB> extends Kysely<SurrealDatabase<DB>> {
  create<TB extends keyof DB>(
    table: TB,
    id?: string | number,
  ): CreateQueryBuilder<SurrealDatabase<DB>, TB, SurrealDatabase<DB>[TB]>
  create<R extends SurrealRecordId<DB>>(record: R): CreateQueryBuilder<SurrealDatabase<DB>, R, SurrealDatabase<DB>[R]>

  create<T extends keyof SurrealDatabase<DB>>(
    target: T,
    id?: string | number,
  ): CreateQueryBuilder<SurrealDatabase<DB>, T, SurrealDatabase<DB>[T]> {
    const ref = id !== undefined ? `${String(target)}:${id}` : String(target)

    return new CreateQueryBuilder({
      queryId: createQueryId(),
      executor: this.getExecutor(),
      queryNode: CreateQueryNode.create(TableNode.create(ref)),
    })
  }

  relate<TB extends keyof DB>(
    from: VertexExpression<SurrealDatabase<DB>>,
    table: TB,
    to: VertexExpression<SurrealDatabase<DB>>,
  ): RelateQueryBuilder<SurrealDatabase<DB>, TB> {
    return new RelateQueryBuilder({
      queryId: createQueryId(),
      executor: this.getExecutor(),
      queryNode: RelateQueryNode.create(
        parseVertexExpression(from),
        TableNode.create(table as string),
        parseVertexExpression(to),
      ),
    })
  }
}
