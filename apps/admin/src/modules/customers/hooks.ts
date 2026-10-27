import type { CollectionConfig } from 'payload'

export const customerHooks: NonNullable<CollectionConfig['hooks']> = {
  beforeValidate: [
    ({ data, req }) => {
      if (req.user?.collection === 'admins' && data?.password) {
        throw new Error('Администратор не может менять пароль покупателя')
      }
      return data
    },
  ],
  beforeChange: [
    ({ data, operation }) => {
      if (operation === 'update' && data?.password) {
        data.socialOnly = false
      }
      return data
    },
  ],
  beforeLogin: [
    ({ user }) => {
      if (user.isBlocked) throw new Error('Аккаунт заблокирован')
      return user
    },
  ],
  beforeDelete: [
    async ({ id, req }) => {
      // Payload uses ON DELETE SET NULL for relationships, but version tables keep
      // a NOT NULL reference to the customer. Remove identities (and their
      // versions) first so a customer can be deleted safely.
      const identities = await req.payload.find({
        collection: 'customer-identities',
        where: { customer: { equals: id } },
        limit: 1000,
        pagination: false,
        depth: 0,
        overrideAccess: true,
        req,
      })

      for (const identity of identities.docs) {
        await req.payload.delete({
          collection: 'customer-identities',
          id: identity.id,
          overrideAccess: true,
          req,
        })
      }

      return id
    },
  ],
  afterChange: [
    async ({ doc, previousDoc, req }) => {
      if (!doc.isBlocked || previousDoc?.isBlocked) return doc

      // Revoke both social and built-in Payload sessions as soon as the
      // customer is blocked.
      await req.payload.db.updateOne({
        id: doc.id,
        collection: 'customers',
        data: { sessions: [], updatedAt: null },
        req,
        returning: false,
      })

      return doc
    },
  ],
}
