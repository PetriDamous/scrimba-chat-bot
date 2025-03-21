import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
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

const hfTextGen = new HuggingFaceInference({
  model: "tiiuae/falcon-7b-instruct",
  temperature: 0.7,
  maxTokens: 200,
  apiKey: hfApiKey,
});

const standaloneQuestionTemplate =
  "Given a question, convert it to a standalone question. question: {question} standalone question:";

const standalonePrompt = PromptTemplate.fromTemplate(
  standaloneQuestionTemplate
);

const chain = standalonePrompt
  .pipe(hfTextGen)
  .pipe(new StringOutputParser())
  .pipe(retriever);
const result = await chain.invoke({
  question:
    "What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful.",
});

console.log(result);

document.addEventListener("submit", (e) => {
  e.preventDefault();
  progressConversation();
});

const response = await async function progressConversation() {
  const userInput = document.getElementById("user-input");
  const chatbotConversation = document.getElementById(
    "chatbot-conversation-container"
  );
  const question = userInput.value;
  userInput.value = "";

  // add human message
  const newHumanSpeechBubble = document.createElement("div");
  newHumanSpeechBubble.classList.add("speech", "speech-human");
  chatbotConversation.appendChild(newHumanSpeechBubble);
  newHumanSpeechBubble.textContent = question;
  chatbotConversation.scrollTop = chatbotConversation.scrollHeight;

  // add AI message
  const newAiSpeechBubble = document.createElement("div");
  newAiSpeechBubble.classList.add("speech", "speech-ai");
  chatbotConversation.appendChild(newAiSpeechBubble);
  newAiSpeechBubble.textContent = result;
  chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
};
