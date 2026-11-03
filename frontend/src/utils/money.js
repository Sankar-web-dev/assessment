// Discounted unit price = price × (1 − discountPercentage / 100)
export const discountedPrice = (product) =>
  product.price * (1 - (product.discountPercentage || 0) / 100)

export const money = (n) => `$${Number(n).toFixed(2)}`

export const round2 = (n) => Math.round(n * 100) / 100
