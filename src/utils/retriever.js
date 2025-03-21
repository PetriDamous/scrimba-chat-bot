import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";

const hfApiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL_LC_CHATBOT;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;

const hfEmbeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: hfApiKey,
  model: "BAAI/bge-large-en-v1.5",
});

const client = createClient(supabaseUrl, supabaseKey);

const vectorStore = new SupabaseVectorStore(hfEmbeddings, {
  client,
  tableName: "documents",
  queryName: "match_documents",
});

const retriever = vectorStore.asRetriever();

export default retriever;
