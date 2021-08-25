/**
 * Unique ID Generator
 * TheoXiong
 */

// const now = () => {
//   let current = Date.now()
//   let last = now.last || current
//   now.last = current > last ? current : last + 1
//   return now.last
// }

const uuid = function () {
  return Math.random().toString(36).substr(2, 10);
};

const unique = (prefix = '', suffix = '') => {
  return prefix + uuid() + suffix
}

export {
  unique
}
