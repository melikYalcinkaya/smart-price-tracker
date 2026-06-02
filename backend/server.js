import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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
      const s = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(s) ||
          p.brand?.toLowerCase().includes(s) ||
          p.category?.toLowerCase().includes(s)
      );
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

app.listen(PORT, () => {
  console.log(`Backend API çalışıyor: http://localhost:${PORT}`);
  console.log(`API uç noktaları:`);
  console.log(`  GET /api/products          - Tüm ürünler (filtreli, sayfalı)`);
  console.log(`  GET /api/products/:id      - Tek ürün detayı`);
  console.log(`  GET /api/price-history     - Fiyat geçmişi (filtreli, sayfalı)`);
  console.log(`  GET /api/price-history/product/:productId - Ürüne ait fiyat geçmişi`);
  console.log(`  GET /api/stats             - Dashboard istatistikleri`);
});
