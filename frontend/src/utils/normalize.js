// Map a backend product document to the shape the storefront components use.
// Backend:  { _id, name, price (selling), comparePrice (original), images[],
//             category: { _id, name, slug }, reviewCount, discountPercentage }
// Frontend: { id, title, thumbnail, price (original), discountPercentage,
//             category (slug), reviews }
export const normalizeProduct = (p) => {
  const price = p.price ?? 0
  const comparePrice = p.comparePrice || 0
  const discountPercentage =
    p.discountPercentage ??
    (comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0)

  return {
    ...p,
    id: p._id ?? p.id,
    title: p.name ?? p.title,
    thumbnail: p.thumbnail ?? p.images?.[0] ?? '',
    images: p.images?.length ? p.images : p.thumbnail ? [p.thumbnail] : [],
    category: p.category?.slug ?? p.category ?? '',
    categoryId: p.category?._id ?? null,
    categoryName: p.category?.name ?? '',
    // Storefront price = original (struck-through); selling price derived by discount.
    price: comparePrice > price ? comparePrice : price,
    sellingPrice: price,
    comparePrice,
    discountPercentage,
    reviews: p.reviews ?? [],
    reviewCount: p.reviewCount ?? p.reviews?.length ?? 0,
  }
}
