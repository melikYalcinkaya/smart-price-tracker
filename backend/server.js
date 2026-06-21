import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { ChromaClient } from "chromadb";
import { getEmbeddingFunction } from "./embedding.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ChromaDB client (lazy init)
let chromaClient = null;
let chromaCollection = null;
const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";

async function getChromaCollection() {
  if (chromaCollection) return chromaCollection;
  const embedder = getEmbeddingFunction();
  chromaClient = new ChromaClient({ host: "localhost", port: 8000 });
  chromaCollection = await chromaClient.getCollection({
    name: "products",
    embeddingFunction: embedder,
  });
  return chromaCollection;
}

// CSV dosyalarının yolları
const DATA_DIR = join(__dirname, "..", "data");
const PRODUCTS_PATH = join(DATA_DIR, "products.csv");
const PRICE_HISTORY_PATH = join(DATA_DIR, "price_history.csv");

// Özel CSV parser — bu CSV'lerde hem "" (çift tırnak kaçışı) hem
// de \, (backslash virgül kaçışı) kullanılmış, standart dışı bir format var.
function parseCSVLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        current += '"';
        i++; // ikinci tırnağı atla
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"' && current.trim() === "") {
        inQuotes = true;
      } else if (ch === "\\" && next === ",") {
        current += ",";
        i++; // virgülü atla
      } else if (ch === ",") {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function readCSV(filePath) {
  const raw = readFileSync(filePath, "utf-8").replace(/\r\n/g, "\n");
  const lines = raw.split("\n").filter((l) => l.trim() !== "");
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    rows.push(row);
  }
  return rows;
}

// Ürün listesini getir (filtreleme ile)
app.get("/api/products", (req, res) => {
  try {
    const products = readCSV(PRODUCTS_PATH);
    let result = [...products];

    // Filtreleme
    const { category, platform, brand, search, sort, order } = req.query;

    if (category) {
      result = result.filter(
        (p) => p.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (platform) {
      result = result.filter(
        (p) => p.platform?.toLowerCase() === platform.toLowerCase()
      );
    }

    if (brand) {
      result = result.filter(
        (p) => p.brand?.toLowerCase() === brand.toLowerCase()
      );
    }

    if (search) {
      // Akıllı anahtar kelime araması kullan (kelime bazlı, skor sıralı)
      // Önceden filtrelenmiş ürünleri de geç (category, platform, brand filtreleri)
      result = smartKeywordSearch(search, result);
      // sayfalama smartKeywordSearch içinde yapılıyor, direkt döndür
      res.json({
        success: true,
        total: result.length,
        page: 1,
        limit: result.length,
        totalPages: 1,
        data: result,
      });
      return;
    }

    // Fiyat sıralaması
    if (sort === "price") {
      result.sort((a, b) => {
        const pa = parseFloat(a.base_price) || 0;
        const pb = parseFloat(b.base_price) || 0;
        return order === "desc" ? pb - pa : pa - pb;
      });
    }

    // Benzersiz ID ekle (link üzerinden hash)
    result = result.map((p, i) => ({
      id: i + 1,
      ...p,
    }));

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const start = (page - 1) * limit;
    const end = start + limit;

    res.json({
      success: true,
      total: result.length,
      page,
      limit,
      totalPages: Math.ceil(result.length / limit),
      data: result.slice(start, end),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Tek ürün detayı
app.get("/api/products/:id", (req, res) => {
  try {
    const products = readCSV(PRODUCTS_PATH);
    const index = parseInt(req.params.id) - 1;

    if (index < 0 || index >= products.length) {
      return res
        .status(404)
        .json({ success: false, error: "Ürün bulunamadı" });
    }

    const product = { id: parseInt(req.params.id), ...products[index] };

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fiyat geçmişi (filtreleme ile)
app.get("/api/price-history", (req, res) => {
  try {
    const history = readCSV(PRICE_HISTORY_PATH);
    let result = [...history];

    const { platform, category, brand, name, sort, order } = req.query;

    if (platform) {
      result = result.filter(
        (h) => h.platform?.toLowerCase() === platform.toLowerCase()
      );
    }

    if (category) {
      result = result.filter(
        (h) => h.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (brand) {
      result = result.filter(
        (h) => h.brand?.toLowerCase() === brand.toLowerCase()
      );
    }

    if (name) {
      const n = name.toLowerCase();
      result = result.filter((h) => h.name?.toLowerCase().includes(n));
    }

    // Tarih sıralaması
    if (sort === "date") {
      result.sort((a, b) => {
        const da = new Date(a.checked_at);
        const db = new Date(b.checked_at);
        return order === "desc" ? db - da : da - db;
      });
    }

    // Fiyat sıralaması
    if (sort === "price") {
      result.sort((a, b) => {
        const pa = parseFloat(a.current_price) || 0;
        const pb = parseFloat(b.current_price) || 0;
        return order === "desc" ? pb - pa : pa - pb;
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const start = (page - 1) * limit;
    const end = start + limit;

    res.json({
      success: true,
      total: result.length,
      page,
      limit,
      totalPages: Math.ceil(result.length / limit),
      data: result.slice(start, end),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Belirli bir ürüne ait fiyat geçmişi (link ile eşleştirme)
app.get("/api/price-history/product/:productId", (req, res) => {
  try {
    const products = readCSV(PRODUCTS_PATH);
    const productIndex = parseInt(req.params.productId) - 1;

    if (productIndex < 0 || productIndex >= products.length) {
      return res
        .status(404)
        .json({ success: false, error: "Ürün bulunamadı" });
    }

    const productLink = products[productIndex].link;
    const history = readCSV(PRICE_HISTORY_PATH);
    const productHistory = history.filter((h) => h.link === productLink);

    // Tarihe göre sırala
    productHistory.sort(
      (a, b) => new Date(b.checked_at) - new Date(a.checked_at)
    );

    res.json({
      success: true,
      data: {
        product: { id: productIndex + 1, ...products[productIndex] },
        history: productHistory,
        priceChanges: productHistory.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// İstatistikler (dashboard için)
app.get("/api/stats", (req, res) => {
  try {
    const products = readCSV(PRODUCTS_PATH);

    const categories = [...new Set(products.map((p) => p.category))];
    const platforms = [...new Set(products.map((p) => p.platform))];
    const brands = [...new Set(products.map((p) => p.brand))];

    const categoryCount = {};
    categories.forEach((c) => {
      categoryCount[c] = products.filter((p) => p.category === c).length;
    });

    const platformCount = {};
    platforms.forEach((p) => {
      platformCount[p] = products.filter((pr) => pr.platform === p).length;
    });

    const prices = products
      .map((p) => parseFloat(p.base_price))
      .filter((p) => !isNaN(p));

    res.json({
      success: true,
      data: {
        totalProducts: products.length,
        totalCategories: categories.length,
        totalPlatforms: platforms.length,
        totalBrands: brands.length,
        categories,
        platforms,
        brands,
        categoryCounts: categoryCount,
        platformCounts: platformCount,
        priceStats: {
          min: Math.min(...prices),
          max: Math.max(...prices),
          avg: prices.reduce((a, b) => a + b, 0) / prices.length,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Doğal dil ile ürün arama (ChromaDB vektör araması)
app.post("/api/search", async (req, res) => {
  try {
    const { query, limit = 20 } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: "query gerekli" });
    }

    let collection;
    try {
      collection = await getChromaCollection();
    } catch {
      return res.status(503).json({
        success: false,
        error: "ChromaDB bağlantısı yok. Önce 'node scripts/index-products.js' çalıştırın.",
      });
    }

    // Sorguyu zenginleştir: kategori/brand/fiyat ipuçları ekle
    const enhancedQuery = buildSearchQuery(query);

    const results = await collection.query({
      queryTexts: [enhancedQuery],
      nResults: Math.min(limit, 100),
    });

    const products = [];
    for (let i = 0; i < results.ids[0].length; i++) {
      const meta = results.metadatas[0][i];
      const distance = results.distances ? results.distances[0][i] : null;
      // Cosine mesafesini benzerlik skoruna çevir (0-1 arası)
      const score = distance != null ? Math.round((1 - distance) * 100) / 100 : null;

      products.push({
        id: parseInt(meta.id),
        platform: meta.platform,
        category: meta.category,
        name: meta.name,
        brand: meta.brand,
        seller: meta.seller,
        seller_rating: meta.seller_rating,
        link: meta.link,
        base_price: parseFloat(meta.base_price) || 0,
        score,
      });
    }

    // Fiyat filtresi varsa uygula (sorgudan çıkarılan)
    const priceFilter = extractPriceFilter(query);
    let filtered = products;
    if (priceFilter) {
      filtered = products.filter((p) => {
        if (priceFilter.max && p.base_price > priceFilter.max) return false;
        if (priceFilter.min && p.base_price < priceFilter.min) return false;
        return true;
      });
    }

    // Düşük skorlu sonuçları filtrele (eşik: 0.25)
    // Cosine mesafesi 0.75 üzeri → benzerlik 0.25 altı → alakasız
    const MIN_SCORE = 0.25;
    const goodResults = filtered.filter((p) => p.score == null || p.score >= MIN_SCORE);

    // Eğer AI arama yeterince iyi sonuç bulamadıysa, akıllı keyword aramasına düş
    if (goodResults.length < 3) {
      console.log(`AI arama sadece ${goodResults.length} iyi sonuç buldu (eşik: ${MIN_SCORE}), keyword fallback deneniyor...`);
      const keywordResults = smartKeywordSearch(query);
      // Keyword sonuçlarını AI sonuçlarının sonuna ekle, duplicate'leri temizle
      const seenIds = new Set(goodResults.map((p) => p.id));
      for (const p of keywordResults) {
        if (!seenIds.has(p.id)) {
          seenIds.add(p.id);
          goodResults.push({ ...p, score: null, fallback: true });
        }
      }
    }

    res.json({
      success: true,
      query,
      total: goodResults.length,
      data: goodResults,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sorguyu embedding için zenginleştir — Türkçe + İngilizce terimleri kapsar
function buildSearchQuery(query) {
  const q = query.toLowerCase();
  const hints = [];

  // === KATEGORİ İPUÇLARI ===
  // Oyun / Gaming laptop
  if (/oyun|gaming|game|oyuncu/i.test(q)) {
    hints.push("kategori: oyun laptopu, gaming laptop");
  }
  // Genel laptop
  if (/laptop|bilgisayar|notebook|dizüstü|pc/i.test(q)) {
    hints.push("kategori: laptop, bilgisayar");
  }
  // Telefon
  if (/telefon|phone|cep|akıllı telefon|iphone|samsung.*telefon|xiaomi.*telefon/i.test(q)) {
    hints.push("kategori: telefon, akıllı telefon");
  }
  // Tablet
  if (/tablet|ipad/i.test(q)) {
    hints.push("kategori: tablet");
  }
  // Kulaklık
  if (/kulaklık|headphone|headset|kulak[iı]k|airpods/i.test(q)) {
    hints.push("kategori: kulaklık");
  }
  // Saat
  if (/saat|watch|akıll[iı] saat|smartwatch/i.test(q)) {
    hints.push("kategori: akıllı saat, smartwatch");
  }
  // Monitör / Ekran
  if (/monitör|monitor|ekran|screen/i.test(q)) {
    hints.push("kategori: monitör, ekran");
  }
  // Klavye / Mouse
  if (/klavye|keyboard|mouse|fare/i.test(q)) {
    hints.push("kategori: klavye, mouse, fare");
  }

  // === MARKA İPUÇLARI ===
  // Büyük markalar (büyük/küçük harf duyarsız)
  const brandMap = {
    "apple": "Apple", "samsung": "Samsung", "lenovo": "Lenovo",
    "hp": "HP", "asus": "ASUS", "acer": "ACER", "msi": "MSI",
    "casper": "Casper", "monster": "Monster", "xiaomi": "Xiaomi",
    "huawei": "Huawei", "dell": "Dell", "honor": "Honor",
    "oppo": "Oppo", "realme": "Realme", "tecno": "Tecno",
    "hometech": "Hometech", "technomen": "Technomen",
    "tcl": "TCL", "vestel": "Vestel", "arçelik": "Arçelik",
    "beko": "Beko", "grundig": "Grundig",
  };
  for (const [key, brand] of Object.entries(brandMap)) {
    if (q.includes(key)) hints.push(`marka: ${brand}`);
  }

  // === FİYAT / BÜTÇE İPUÇLARI (embedding'i etkilemesin diye eklemiyoruz) ===
  // Fiyat filtreleri extractPriceFilter ile ayrıca işleniyor

  return hints.length > 0 ? `${query} (${hints.join(", ")})` : query;
}

// Akıllı anahtar kelime araması: sorguyu kelimelere böl, her kelimeyi
// ürünün farklı alanlarında ara, eşleşme sayısına göre sırala.
// ChromaDB'nin olmadığı veya düşük skorlu sonuç verdiği durumlarda fallback.
function smartKeywordSearch(query, preselectedProducts) {
  const products = preselectedProducts || readCSV(PRODUCTS_PATH);
  const words = query
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((w) => w.length >= 2);

  if (words.length === 0) return [];

  // Fiyat filtresi varsa çıkar
  const priceFilter = extractPriceFilter(query);

  const scored = products
    .map((p, idx) => {
      let score = 0;
      const name = (p.name || "").toLowerCase();
      const category = (p.category || "").toLowerCase();
      const brand = (p.brand || "").toLowerCase();
      const seller = (p.seller || "").toLowerCase();

      for (const word of words) {
        // Tam eşleşme → yüksek skor
        if (name.includes(word)) score += 3;
        if (category.includes(word)) score += 5; // kategori eşleşmesi daha önemli
        if (brand.includes(word)) score += 2;
        if (seller.includes(word)) score += 1;
      }

      // Özel: "oyun" + "laptop" ikisi birden varsa bonus
      const hasGaming = words.some((w) => /oyun|gaming|game/i.test(w));
      const hasLaptop = words.some((w) => /laptop|bilgisayar|notebook/i.test(w));
      if (hasGaming && hasLaptop && category.includes("laptop")) {
        score += 10;
      }

      return {
        id: idx + 1,
        platform: p.platform || "",
        category: p.category || "",
        name: p.name || "",
        brand: p.brand || "",
        seller: p.seller || "",
        seller_rating: p.seller_rating || "",
        link: p.link || "",
        base_price: parseFloat(p.base_price) || 0,
        score: null,
        keywordScore: score,
        fallback: true,
      };
    })
    .filter((p) => {
      if (p.keywordScore === 0) return false;
      if (priceFilter) {
        if (priceFilter.max && p.base_price > priceFilter.max) return false;
        if (priceFilter.min && p.base_price < priceFilter.min) return false;
      }
      return true;
    })
    .sort((a, b) => b.keywordScore - a.keywordScore)
    .slice(0, 50);

  return scored;
}

// Doğal dil sorgusundan fiyat filtresi çıkar
function extractPriceFilter(query) {
  const q = query.toLowerCase();
  // "under X TL", "X TL altında", "max X TL", "en fazla X TL"
  const maxPatterns = [
    /(?:under|max|en fazla|altında|az|maximum)\s*(\d[\d.,]*)\s*(?:TL|₺|lira)?/i,
    /(\d[\d.,]*)\s*(?:TL|₺|lira)?\s*(?:altında|aşağı|under)/i,
    /(?:bütçe|butce)\s*(\d[\d.,]*)/i,
  ];
  // "over X TL", "X TL üstünde", "min X TL"
  const minPatterns = [
    /(?:over|min|en az|üstünde|üstü|minimum)\s*(\d[\d.,]*)\s*(?:TL|₺|lira)?/i,
    /(\d[\d.,]*)\s*(?:TL|₺|lira)?\s*(?:üstü|üstünde|üzeri|over)/i,
  ];

  let min = null;
  let max = null;

  for (const pattern of maxPatterns) {
    const match = q.match(pattern);
    if (match) {
      max = parseFloat(match[1].replace(",", "."));
      break;
    }
  }
  for (const pattern of minPatterns) {
    const match = q.match(pattern);
    if (match) {
      min = parseFloat(match[1].replace(",", "."));
      break;
    }
  }

  // "X-Y TL arası", "X ile Y TL arasında"
  const rangeMatch = q.match(/(\d[\d.,]*)\s*(?:-|ile|to|ve)\s*(\d[\d.,]*)\s*(?:TL|₺|lira)?\s*(?:arası|arasinda|aralığı|range)?/i);
  if (rangeMatch) {
    min = parseFloat(rangeMatch[1].replace(",", "."));
    max = parseFloat(rangeMatch[2].replace(",", "."));
  }

  if (min !== null || max !== null) return { min, max };
  return null;
}

// Index durumunu sorgula
app.get("/api/search/status", async (req, res) => {
  try {
    const collection = await getChromaCollection();
    const count = await collection.count();
    res.json({ success: true, indexed: true, productCount: count });
  } catch {
    res.json({ success: true, indexed: false, productCount: 0 });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API çalışıyor: http://localhost:${PORT}`);
  console.log(`API uç noktaları:`);
  console.log(`  GET /api/products          - Tüm ürünler (filtreli, sayfalı)`);
  console.log(`  GET /api/products/:id      - Tek ürün detayı`);
  console.log(`  GET /api/price-history     - Fiyat geçmişi (filtreli, sayfalı)`);
  console.log(`  GET /api/price-history/product/:productId - Ürüne ait fiyat geçmişi`);
  console.log(`  GET /api/stats             - Dashboard istatistikleri`);
  console.log(`  POST /api/search           - Doğal dil ile ürün arama (ChromaDB)`);
  console.log(`  GET /api/search/status     - ChromaDB index durumu`);
});
