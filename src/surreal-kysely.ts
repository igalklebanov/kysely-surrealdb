import {Kysely, TableNode} from 'kysely'

import {CreateQueryNode} from './operation-node/create-query-node.js'
import {RelateQueryNode} from './operation-node/relate-query-node.js'
import {CreateQueryBuilder} from './query-builder/create-query-builder.js'
import {RelateQueryBuilder} from './query-builder/relate-query-builder.js'
import {createQueryId} from './util/query-id.js'
import type {AnyEdge, SurrealDatabase, SurrealRecordId} from './util/surreal-types.js'

/**
 * The main SurrealKysely class.
 *
 * You should create one instance of `SurrealKysely` per database & namespace
 * using the {@link SurrealKysely} constructor.
 *
 * ### Examples
 *
 * This example assumes your database has tables `person` and `pet` and there's
 * and `own` relation between them.
 *
 * ```ts
 * import type {Generated} from 'kysely'
 * import {SurrealDbHttpDialect, SurrealKysely} from 'kysely-surrealdb'
 * import {fetch} from 'undici'
 *
 * interface Person {
 *   first_name: string
 *   last_name: string
 * }
 *
 * interface Pet {
 *   name: string
 *   species: 'cat' | 'dog'
 * }
 *
 * interface Own {
 *   time: {
 *     adopted: string
 *   }
 * }
 *
 * interface Database {
 *   person: Person
 *   own: SurrealEdge<Own>
 *   pet: Pet
 * }
 *
 * const db = new SurrealKysely<Database>({
 *   dialect: new SurrealDbHttpDialect({
 *     database: 'test',
 *     fetch,
 *     hostname: 'localhost:8000',
 *     namespace: 'test',
 *     password: 'root',
 *     username: 'root',
 *   }),
 * })
 * ```
 *
 * @typeParam DB - The database interface type. Keys of this type must be table names
 *    in the database and values must be interfaces that describe the rows in those
 *    tables. See the examples above.
 */
export class SurrealKysely<DB> extends Kysely<SurrealDatabase<DB>> {
  /**
   * Creates a create query.
   *
   * This query returns the created record by default. See the
   * {@link CreateQueryBuilder.return | return} method for a way to control the
   * returned data.
   *
   * ### Examples
   *
   * ```ts
   * const tobie = await db
   *   .create('person')
   *   .set({
   *     name: 'Tobie',
   *     company: 'SurrealDB',
   *     skills: ['Rust', 'Go', 'JavaScript'],
   *   })
   *   .executeTakeFirst()
   * ```
   *
   * The generated SurrealQL:
   *
   * ```sql
   * let $1 = 'Tobie';
   * let $2 = 'SurrealDB';
   * let $3 = [\"Rust\",\"Go\",\"JavaScript\"];
   * create person set name = $1, company = $2, skills = $3;
   * ```
   *
   * ...
   *
   * ```ts
   * await db
   *   .create('person:tobie')
   *   .content({
   *     name: 'Tobie',
   *     company: 'SurrealDB',
   *     skills: ['Rust', 'Go', 'JavaScript'],
   *   })
   *   .return('none')
   *   .execute()
   * ```
   *
   * The generated SurrealQL:
   *
   * ```sql
   * let $1 = {\"name\":\"Tobie\",\"company\":\"SurrealDB\",\"skills\":[\"Rust\",\"Go\",\"JavaScript\"]};
   * create person:tobie content $1 return none;
   * ```
   */
  create<TB extends keyof DB>(table: TB, id?: string | number): CreateQueryBuilder<SurrealDatabase<DB>, TB>

  create<R extends SurrealRecordId<DB>>(record: R): CreateQueryBuilder<SurrealDatabase<DB>, R>

  create<T extends keyof SurrealDatabase<DB>>(target: T, id?: string | number): any {
    const ref = id !== undefined ? `${String(target)}:${id}` : String(target)

    return new CreateQueryBuilder({
      executor: this.getExecutor(),
      queryId: createQueryId(),
      queryNode: CreateQueryNode.create(TableNode.create(ref)),
    })
  }

  /**
   * Creates a relate query.
   *
   * This query returns the created relation by default. See the {@link RelateQueryBuilder.return | return}
   * method for a way to control the returned data.
   *
   * This method only accepts tables that are defined as {@link SurrealEdge}s.
   *
   * ### Examples
   *
   * ```ts
   * import {sql} from 'kysely'
   *
   * const relation = await db
   *   .relate('write')
   *   .from('user:tobie')
   *   .to('article:surreal')
   *   .set({
   *     'time.written': sql`time::now()`,
   *   })
   *   .executeTakeFirst()
   * ```
   *
   * The generated SurrealQL:
   *
   * ```sql
   * relate user:tobie -> write -> article:surreal
   * set time.written = time::now();
   * ```
   *
   * ...
   *
   * ```ts
   * import {sql} from 'kysely'
   *
   * await db
   *   .relate('like')
   *   .from(db.selectFrom('company:surrealdb').select('users'))
   *   .to(
   *     db
   *       .selectFrom('user')
   *       .where(sql`${sql.ref('tags')} contains 'developer'`)
   *       .selectAll(),
   *   )
   *   .set({
   *     'time.connected': sql`time::now()`,
   *   })
   *   .execute()
   * ```
   *
   * The generated SurrealQL:
   *
   * ```sql
   * let $1 = (select users from company:surrealdb);
   * let $2 = (select * from user where tags contains 'developer');
   * relate $1 -> like -> $2 set time.connected = time::now();
   * ```
   */
  relate<E extends AnyEdge<DB>>(edge: E): RelateQueryBuilder<SurrealDatabase<DB>, E> {
    return new RelateQueryBuilder({
      executor: this.getExecutor(),
      queryId: createQueryId(),
      queryNode: RelateQueryNode.create(TableNode.create(edge)),
    })
  }
}
