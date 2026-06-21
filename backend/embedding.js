// Çok dilli (multilingual) embedding function
// Xenova/paraphrase-multilingual-MiniLM-L12-v2: 50+ dil desteği, Türkçe dahil
// ChromaDB JS client'ına uygun EmbeddingFunction arayüzünü implemente eder

import { pipeline } from "@xenova/transformers";

let embedPipeline = null;

async function getPipeline() {
  if (embedPipeline) return embedPipeline;
  console.log("Çok dilli embedding modeli yükleniyor (ilk çalıştırmada indirilecek)...");
  embedPipeline = await pipeline(
    "feature-extraction",
    "Xenova/paraphrase-multilingual-MiniLM-L12-v2",
    { quantized: true } // Daha hızlı, daha az bellek
  );
  console.log("Embedding modeli hazır.");
  return embedPipeline;
}

/**
 * ChromaDB uyumlu embedding function sınıfı.
 * ChromaClient bu sınıfın `generate(texts)` metodunu çağırır.
 */
export class MultilingualEmbeddingFunction {
  async generate(texts) {
    const pipe = await getPipeline();

    // Metinlerin embedding'lerini batch halinde al
    const embeddings = [];
    // Büyük batch'leri tek seferde işle (bellek limitine dikkat)
    const BATCH = 32;
    for (let i = 0; i < texts.length; i += BATCH) {
      const batch = texts.slice(i, i + BATCH);
      const output = await pipe(batch, {
        pooling: "mean",
        normalize: true,
      });
      const batchEmbeddings = output.tolist();
      embeddings.push(...batchEmbeddings);
    }
    return embeddings;
  }

  // ChromaDB JS client embedding function arayüzü
  async generateEmbeddings(texts) {
    return this.generate(texts);
  }
}

// Singleton instance
let instance = null;

export function getEmbeddingFunction() {
  if (!instance) {
    instance = new MultilingualEmbeddingFunction();
  }
  return instance;
}
