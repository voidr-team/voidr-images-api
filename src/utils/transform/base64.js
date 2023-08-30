export const base64decode = (data = '') =>
  Buffer.from(data, 'base64').toString('ascii')

export const base64encode = (data = '') => Buffer.from(data).toString('base64')
