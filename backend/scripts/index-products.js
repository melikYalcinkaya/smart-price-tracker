// Ürünleri ChromaDB'ye indexleme scripti
// Kullanım: node scripts/index-products.js

import { ChromaClient } from "chromadb";
import { DefaultEmbeddingFunction } from "@chroma-core/default-embed";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "..", "data");
const PRODUCTS_PATH = join(DATA_DIR, "products.csv");

// CSV parser (server.js'deki ile aynı)
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
        i++;
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
        i++;
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

// Embedding için zengin metin oluştur
function buildDocumentText(product) {
  const parts = [];
  if (product.name) parts.push(product.name);
  parts.push(`Category: ${product.category}`);
  parts.push(`Brand: ${product.brand}`);
  parts.push(`Platform: ${product.platform}`);
  parts.push(`Seller: ${product.seller}`);
  parts.push(`Price: ${product.base_price} TL`);
  return parts.join(". ");
}

async function main() {
  console.log("ChromaDB'ye bağlanılıyor...");
  const client = new ChromaClient({ host: "localhost", port: 8000 });

  // Heartbeat ile bağlantıyı kontrol et
  const heartbeat = await client.heartbeat();
  console.log("ChromaDB heartbeat:", heartbeat);

  // Koleksiyonu sıfırla (önce sil, sonra yeniden oluştur)
  try {
    await client.deleteCollection({ name: "products" });
    console.log("Eski koleksiyon silindi.");
  } catch {
    // koleksiyon zaten yoksa hata vermez
  }

  const embedder = new DefaultEmbeddingFunction();
  const collection = await client.createCollection({
    name: "products",
    metadata: { "hnsw:space": "cosine" },
    embeddingFunction: embedder,
  });
  console.log("Yeni koleksiyon oluşturuldu.");

  // CSV'den ürünleri oku
  console.log("Ürünler CSV'den okunuyor...");
  const products = readCSV(PRODUCTS_PATH);
  console.log(`${products.length} ürün bulundu.`);

  // Dökümanları hazırla
  const ids = [];
  const documents = [];
  const metadatas = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    ids.push(`product-${i + 1}`);
    documents.push(buildDocumentText(p));
    metadatas.push({
      id: String(i + 1),
      platform: p.platform || "",
      category: p.category || "",
      name: p.name || "",
      brand: p.brand || "",
      seller: p.seller || "",
      seller_rating: p.seller_rating || "",
      link: p.link || "",
      base_price: p.base_price || "0",
      added_at: p.added_at || "",
    });
  }

  // Batch halinde ekle (500'er)
  const BATCH_SIZE = 500;
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const end = Math.min(i + BATCH_SIZE, ids.length);
    await collection.add({
      ids: ids.slice(i, end),
      documents: documents.slice(i, end),
      metadatas: metadatas.slice(i, end),
    });
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${i + 1}-${end} / ${ids.length} ürün indexlendi`);
  }

  console.log(`\nToplam ${ids.length} ürün ChromaDB'ye başarıyla indexlendi!`);

  // Test araması
  console.log("\nTest araması yapılıyor: 'oyun laptopu'");
  const results = await collection.query({
    queryTexts: ["oyun laptopu"],
    nResults: 3,
  });

  console.log("En alakalı 3 ürün:");
  for (let i = 0; i < results.documents[0].length; i++) {
    console.log(`  ${i + 1}. [${results.metadatas[0][i].brand}] ${results.metadatas[0][i].name?.substring(0, 80)}...`);
    console.log(`     Fiyat: ${results.metadatas[0][i].base_price} TL | Mesafe: ${results.distances[0][i].toFixed(4)}`);
  }
}

main().catch((err) => {
  console.error("Hata:", err.message);
  process.exit(1);
});
