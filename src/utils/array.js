// 非空数组
export const unemptyArray = arr => {
  return Array.isArray(arr) && arr.length > 0
}

// 二维矩阵
export const is2DMatrix = matrix => {
  if (unemptyArray(matrix) && unemptyArray(matrix[0])) {
    let column = matrix[0].length
    return matrix.every(item => {
      return unemptyArray(item) && item.length === column
    })
  }
  return false
}