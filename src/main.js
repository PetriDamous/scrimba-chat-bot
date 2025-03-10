import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

(async () => {
  try {
    // 1. Fetch the text file to process
    const result = await fetch("/scrimba-info.txt");
    const text = await result.text();

    // 2. Split the text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500, // Chunk size for splitting text
      chunkOverlap: 50, // Overlap between chunks for better context
      separators: ["\n\n", "\n", " ", ""], // Logical split points
    });
    const documents = await splitter.createDocuments([text]);

    // 3. Initialize Hugging Face embeddings using your custom class
    const hfEmbeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY, // Hugging Face API key
      model: "sentence-transformers/all-MiniLM-L6-v2", // Chosen Hugging Face model
    });

    // 4. Initialize Supabase client
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL_LC_CHATBOT;
    const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;

    console.log(import.meta.env.VITE_HUGGINGFACE_API_KEY);

    if (!import.meta.env.VITE_HUGGINGFACE_API_KEY) {
      throw new Error("Hugging Face API key is missing.");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 5. Store documents and embeddings in Supabase using VectorStore
    await SupabaseVectorStore.fromDocuments(
      documents, // Preprocessed documents from text splitter
      hfEmbeddings, // Custom Hugging Face embeddings
      {
        client: supabase, // Supabase client
        tableName: "documents", // Supabase table for storing vectors
      }
    );

    console.log("Documents and embeddings successfully added to Supabase!");

    // 6. Query Supabase for similar documents
    // const queryText = "Your query text here"; // Example query
    // const queryEmbedding = await hfEmbeddings.embedQuery(queryText); // Generate query embedding

    // const { data, error } = await supabase.rpc("match_documents", {
    //   query_embedding: queryEmbedding, // Query embedding
    //   match_count: 5, // Number of similar results to retrieve
    //   filter: {}, // Optional metadata filters
    // });

    // if (error) {
    //   console.error("Error querying documents:", error.message);
    // } else {
    //   console.log("Query results:", data);
    // }
  } catch (err) {
    console.error("Error:", err.message);
  }
})();
