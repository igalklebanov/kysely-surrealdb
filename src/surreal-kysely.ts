import {Kysely, TableNode} from 'kysely'

import {CreateQueryNode} from './operation-node/create-query-node.js'
import {RelateQueryNode} from './operation-node/relate-query-node.js'
import {parseVertexExpression, type VertexExpression} from './parser/vertex-expression-parser.js'
import {CreateQueryBuilder} from './query-builder/create-query-builder.js'
import {RelateQueryBuilder} from './query-builder/relate-query-builder.js'
import {createQueryId} from './util/query-id.js'
import type {SurrealDatabase} from './util/surreal-types.js'

export class SurrealKysely<DB> extends Kysely<SurrealDatabase<DB>> {
  create<T extends keyof SurrealDatabase<DB>>(
    target: T,
  ): CreateQueryBuilder<SurrealDatabase<DB>, T, SurrealDatabase<DB>[T]> {
    return new CreateQueryBuilder({
      queryId: createQueryId(),
      executor: this.getExecutor(),
      queryNode: CreateQueryNode.create(TableNode.create(target as string)),
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
