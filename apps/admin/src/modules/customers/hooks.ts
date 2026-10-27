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
  beforeLogin: [
    ({ user }) => {
      if (user.isBlocked) throw new Error('Аккаунт заблокирован')
      return user
    },
  ],
}
