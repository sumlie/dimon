import type { Access, FieldAccess } from 'payload'

export const adminOrSelf: Access = ({ req: { user } }) => {
  if (user?.collection === 'admins') return true
  if (user?.collection === 'customers') return { id: { equals: user.id } }
  return false
}

export const onlyCustomer: FieldAccess = ({ req: { user } }) =>
  user?.collection === 'customers'

export const onlyAdmin: FieldAccess = ({ req: { user } }) =>
  user?.collection === 'admins'
