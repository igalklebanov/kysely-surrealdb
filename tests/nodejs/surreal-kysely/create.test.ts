import {expect} from 'chai'

import type {SurrealKysely} from '../../../src'
import {dropTable, getDb, testSurrealQL, type Database} from './shared'

describe('SurrealKysely.create(...)', () => {
  let db: SurrealKysely<Database>

  before(async () => {
    db = getDb()
  })

  after(async () => {
    await dropTable('person')
  })

  it('should execute a create...set query with a random id.', async () => {
    const query = db.create('person').set({
      name: 'Tobie',
      company: 'SurrealDB',
      skills: ['Rust', 'Go', 'JavaScript'],
    })

    testSurrealQL(query, {
      sql: 'create person set name = $1, company = $2, skills = $3',
      parameters: ['Tobie', 'SurrealDB', ['Rust', 'Go', 'JavaScript']],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').which.has.lengthOf(1)
  })

  it('should execute a create...set query with a specific numeric id.', async () => {
    const query = db.create('person:100').set({
      name: 'Tobie',
      company: 'SurrealDB',
      skills: ['Rust', 'Go', 'JavaScript'],
    })

    testSurrealQL(query, {
      sql: 'create person:100 set name = $1, company = $2, skills = $3',
      parameters: ['Tobie', 'SurrealDB', ['Rust', 'Go', 'JavaScript']],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').which.has.lengthOf(1)
    expect(actual[0]).to.deep.equal({
      id: 'person:100',
      name: 'Tobie',
      company: 'SurrealDB',
      skills: ['Rust', 'Go', 'JavaScript'],
    })
  })

  it('should execute a create...set query with a specific string id.', async () => {
    const query = db.create('person:tobie').set({
      name: 'Tobie',
      company: 'SurrealDB',
      skills: ['Rust', 'Go', 'JavaScript'],
    })

    testSurrealQL(query, {
      sql: 'create person:tobie set name = $1, company = $2, skills = $3',
      parameters: ['Tobie', 'SurrealDB', ['Rust', 'Go', 'JavaScript']],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').which.has.lengthOf(1)
    expect(actual[0]).to.deep.equal({
      id: 'person:tobie',
      name: 'Tobie',
      company: 'SurrealDB',
      skills: ['Rust', 'Go', 'JavaScript'],
    })
  })

  it('should execute a create...content query with a random id.', async () => {
    const query = db.create('person').content({
      name: 'Tobie',
      company: 'SurrealDB',
      skills: ['Rust', 'Go', 'JavaScript'],
    })

    testSurrealQL(query, {
      sql: 'create person content $1',
      parameters: [
        {
          name: 'Tobie',
          company: 'SurrealDB',
          skills: ['Rust', 'Go', 'JavaScript'],
        },
      ],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').which.has.lengthOf(1)
  })

  it('should execute a create...content query with a specific id.', async () => {
    const query = db.create('person:tobie2').content({
      name: 'Tobie',
      company: 'SurrealDB',
      skills: ['Rust', 'Go', 'JavaScript'],
    })

    testSurrealQL(query, {
      sql: 'create person:tobie2 content $1',
      parameters: [
        {
          name: 'Tobie',
          company: 'SurrealDB',
          skills: ['Rust', 'Go', 'JavaScript'],
        },
      ],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').which.has.lengthOf(1)
    expect(actual[0]).to.deep.equal({
      id: 'person:tobie2',
      name: 'Tobie',
      company: 'SurrealDB',
      skills: ['Rust', 'Go', 'JavaScript'],
    })
  })

  it('should execute a create...set...return none query.', async () => {
    const query = db
      .create('person')
      .set({
        age: 46,
        username: 'john-smith',
      })
      .return('none')

    testSurrealQL(query, {
      sql: 'create person set age = $1, username = $2 return none',
      parameters: [46, 'john-smith'],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').that.is.empty
  })

  it('should execute a create...set...return diff query.', async () => {
    const query = db
      .create('person')
      .set({
        age: 46,
        username: 'john-smith',
      })
      .return('diff')

    testSurrealQL(query, {
      sql: 'create person set age = $1, username = $2 return diff',
      parameters: [46, 'john-smith'],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').which.has.lengthOf(1)
  })

  it('should execute a create...set...return before query.', async () => {
    const query = db
      .create('person')
      .set({
        age: 46,
        username: 'john-smith',
      })
      .return('before')

    testSurrealQL(query, {
      sql: 'create person set age = $1, username = $2 return before',
      parameters: [46, 'john-smith'],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').which.has.lengthOf(1)
  })

  it('should execute a create...set...return after query.', async () => {
    const query = db
      .create('person')
      .set({
        age: 46,
        username: 'john-smith',
      })
      .return('after')

    testSurrealQL(query, {
      sql: 'create person set age = $1, username = $2 return after',
      parameters: [46, 'john-smith'],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').which.has.lengthOf(1)
  })

  it('should execute a create...set...return field query.', async () => {
    const query = db
      .create('person')
      .set({
        age: 46,
        username: 'john-smith',
        interests: ['skiing', 'music'],
      })
      .return('interests')

    testSurrealQL(query, {
      sql: 'create person set age = $1, username = $2, interests = $3 return interests',
      parameters: [46, 'john-smith', ['skiing', 'music']],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').which.has.lengthOf(1)
    expect(actual[0]).to.deep.equal({interests: ['skiing', 'music']})
  })

  it('should execute a create...set...return multiple fields query.', async () => {
    const query = db
      .create('person')
      .set({
        age: 46,
        username: 'john-smith',
        interests: ['skiing', 'music'],
      })
      .return(['name', 'interests'])

    testSurrealQL(query, {
      sql: 'create person set age = $1, username = $2, interests = $3 return name, interests',
      parameters: [46, 'john-smith', ['skiing', 'music']],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').which.has.lengthOf(1)
    expect(actual[0]).to.deep.equal({interests: ['skiing', 'music'], name: null})
  })

  it('should execute a create...set query with table and id as 2 separate arguments.', async () => {
    const query = db.create('person', 'recordid').set({
      age: 46,
      username: 'john-smith',
      interests: ['skiing', 'music'],
    })

    testSurrealQL(query, {
      sql: 'create person:recordid set age = $1, username = $2, interests = $3',
      parameters: [46, 'john-smith', ['skiing', 'music']],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').which.has.lengthOf(1)
  })
})
