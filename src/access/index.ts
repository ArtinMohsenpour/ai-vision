import type { Access, FieldAccess } from 'payload'

/** True only for accounts from the admin `users` collection. Customers never pass. */
export const isAdmin: Access = ({ req: { user } }) => user?.collection === 'users'

export const isAdminField: FieldAccess = ({ req: { user } }) => user?.collection === 'users'

/** Admin sees everything; a logged-in customer sees only their own customer record. */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (user?.collection === 'users') return true
  if (user?.collection === 'customers') return { id: { equals: user.id } }
  return false
}

export const anyone: Access = () => true
