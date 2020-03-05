export const toFixed = (num, s) => {
  let times = Math.pow(10, s)
  let des = num * times + (num >= 0 || -1) * 0.5
  return parseInt(des, 10) / times
}

export const isPercentage = (p) => {
  return (typeof p === 'string') && /^\d+(\.\d+)?%$/.test(p)
}