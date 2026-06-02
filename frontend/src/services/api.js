const API_BASE = "/api";

export async function fetchProducts({ category, platform, brand, search, sort, order, page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (platform) params.set("platform", platform);
  if (brand) params.set("brand", brand);
  if (search) params.set("search", search);
  if (sort) params.set("sort", sort);
  if (order) params.set("order", order);
  params.set("page", page);
  params.set("limit", limit);

  const res = await fetch(`${API_BASE}/products?${params}`);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function fetchPriceHistory({ platform, category, brand, name, sort, order, page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (platform) params.set("platform", platform);
  if (category) params.set("category", category);
  if (brand) params.set("brand", brand);
  if (name) params.set("name", name);
  if (sort) params.set("sort", sort);
  if (order) params.set("order", order);
  params.set("page", page);
  params.set("limit", limit);

  const res = await fetch(`${API_BASE}/price-history?${params}`);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function fetchProductPriceHistory(productId) {
  const res = await fetch(`${API_BASE}/price-history/product/${productId}`);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

// CSV verisini frontend formatına dönüştür
export function mapProduct(raw) {
  const basePrice = parseFloat(raw.base_price) || 0;
  return {
    id: raw.id,
    store: raw.platform || raw.store,
    title: raw.name || raw.title,
    brand: raw.brand,
    category: raw.category,
    seller: raw.seller,
    sellerRating: raw.seller_rating,
    link: raw.link,
    currentPrice: parseFloat(raw.current_price) || basePrice,
    originalPrice: basePrice,
    imageUrl: null, // CSV'de görsel yok, placeholder kullanılacak
    status: "neutral",
    percentage: null,
    addedAt: raw.added_at,
  };
}
