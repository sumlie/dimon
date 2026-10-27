import * as migration_20261027_182612_add_customer_identities from './20261027_182612_add_customer_identities'

export const migrations = [
  {
    up: migration_20261027_182612_add_customer_identities.up,
    down: migration_20261027_182612_add_customer_identities.down,
    name: '20261027_182612_add_customer_identities',
  },
]
