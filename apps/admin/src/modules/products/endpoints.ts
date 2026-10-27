import type { Endpoint } from 'payload'

import {
  createNumberFieldEndpoint,
  numberField,
} from '@/shared/api/createNumberFieldEndpoint'
import { createSelectFieldEndpoint } from '@/shared/api/createSelectFieldEndpoint'

import { productStatus } from './status'

export const productEndpoints: Endpoint[] = [
  createNumberFieldEndpoint({
    collection: 'products',
    fields: {
      stock: { ...numberField },
      priceRub: { ...numberField },
      priceByn: { ...numberField },
    },
  }),
  createSelectFieldEndpoint({
    collection: 'products',
    fields: {
      status: { options: Object.keys(productStatus) },
    },
  }),
]
