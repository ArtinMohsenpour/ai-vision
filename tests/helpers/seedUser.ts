import { randomUUID } from 'node:crypto'
import { BasePayload, type Payload } from 'payload'

import config from '../../src/payload.config.js'

export async function getLocalTestPayload() {
  const database = new URL(process.env.DATABASE_URL || 'postgres://invalid')
  if (!['localhost', '127.0.0.1', '[::1]'].includes(database.hostname)) {
    throw new Error('The account tests require a local PostgreSQL database.')
  }
  return new BasePayload().init({ config })
}

export async function seedTestUser(payload: Payload) {
  const suffix = randomUUID()
  const password = `Temporary admin test password ${suffix}!`
  const user = await payload.create({
    collection: 'users',
    data: {
      email: `cms-admin-${suffix}@example.test`,
      password,
      firstName: 'Test',
      lastName: 'Admin',
    },
  })
  return { id: user.id, email: user.email, password }
}
