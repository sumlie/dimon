import type { GlobalConfig } from 'payload'

const validateUrl = (value: unknown) => {
  if (typeof value !== 'string') {
    return 'Укажите ссылку'
  }
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return 'Допустимы только HTTP- и HTTPS-ссылки'
    }
    return true
  } catch {
    return 'Введите корректную ссылку'
  }
}

export const SocialLinks: GlobalConfig = {
  slug: 'social-links',

  label: 'Social Links',

  admin: {
    group: 'Tweaks',
  },

  fields: [
    {
      name: 'telegram',
      type: 'text',
      label: 'Telegram',
      required: true,
      validate: validateUrl,
    },
    {
      name: 'tiktok',
      type: 'text',
      label: 'TikTok',
      required: true,
      validate: validateUrl,
    },
    {
      name: 'instagram',
      type: 'text',
      label: 'Instagram',
      required: true,
      validate: validateUrl,
    },
  ],
}
