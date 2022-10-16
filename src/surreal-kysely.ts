import {Kysely, TableNode} from 'kysely'
import {CreateQueryNode} from './operation-node/create-query-node.js'

import {CreateQueryBuilder} from './query-builder/create-query-builder.js'
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
}
