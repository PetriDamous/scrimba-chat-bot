import { Embeddings } from "langchain/embeddings";

class HuggingFaceAPIEmbeddings extends Embeddings {
  constructor({ apiKey, model }) {
    super();
    this.apiKey = apiKey;
    this.model = model;
    this.apiUrl = `https://api-inference.huggingface.co/models/${this.model}`;
  }

  async embedDocuments(texts) {
    return Promise.all(texts.map(async (text) => this.embedQuery(text)));
  }

  async embedQuery(text) {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result[0]; // Return the embedding vector
  }
}

export default HuggingFaceAPIEmbeddings;
