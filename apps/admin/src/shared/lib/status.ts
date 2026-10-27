export type StatusMeta = { label: string; color: string }

export const toOptions = (map: Record<string, StatusMeta>) =>
  Object.entries(map).map(([value, { label }]) => ({ label, value }))
