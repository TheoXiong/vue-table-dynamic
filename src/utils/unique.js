/**
 * Unique ID Generator
 * TheoXiong
 */

const now = () => {
  let current = Date.now()
  let last = now.last || current
  now.last = current > last ? current : last + 1
  return now.last
}

const unique = (prefix = '', suffix = '') => {
  return prefix + now().toString(16) + suffix
}

export {
  unique
}