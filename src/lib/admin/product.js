export const blankProduct = (shared = {}) => ({ title: "", brand: "", category: "", subcategory: "", tags: [], color: "", model: "", price: "", description: "", images: [], ...shared });

export function productFields(product) {
  const { title, brand, category, subcategory, tags, color, model, price, description } = product;
  if (!title.trim() || !category.trim() || !subcategory.trim()) throw new Error("Give every product a name, category and type.");
  const amount = price === "" || price == null ? null : Number(price);
  if (amount !== null && (!Number.isInteger(amount) || amount < 1 || amount > 10_000_000)) throw new Error("Use a whole price from ₹1 to ₹1,00,00,000, or leave it blank.");
  if (!product.images.length || product.images.length > 12) throw new Error("Each product needs 1 to 12 photos.");
  return { title: title.trim(), brand: brand || null, category: category.trim(), subcategory: subcategory.trim(), tags, color: color || null, model: model || null, price: amount, description };
}
