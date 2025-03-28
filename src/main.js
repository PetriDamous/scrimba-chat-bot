import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import retriever from "./utils/retriever.js";
import { combineDocs } from "./utils/helper.js";

const hfApiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;

const hfTextGen = new HuggingFaceInference({
  model: "meta-llama/Llama-3.2-1B",
  temperature: 0.7,
  maxTokens: 200,
  apiKey: hfApiKey,
});

const standaloneQuestionTemplate = `Transform the given query into a fully standalone and concise question. The output must only be the standalone question without any additional commentary, explanation, or follow-up sentences. Ensure the question is short, clear, and self-contained. 
Query: {question}
Standalone Question:
`;

const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba based on the context provided. Try to find the answer in the context. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@scrimba.com. Don't try to make up an answer. Always speak as if you were chatting to a friend.
constext: {context}
question: {question}
answer: 
`;

const standalonePrompt = PromptTemplate.fromTemplate(
  standaloneQuestionTemplate
);

const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

const standaloneQuestionChain = standalonePrompt
  .pipe(hfTextGen)
  .pipe(new StringOutputParser());

const retrievCombineDocsChain = RunnableSequence.from([
  (prevValues) => prevValues.standaloneQuestionChain,
  retriever,
  combineDocs,
]);

const answerChain = answerPrompt.pipe(hfTextGen).pipe(new StringOutputParser());

const chain = RunnableSequence.from([
  {
    standaloneQuestionChain: standaloneQuestionChain,
    orginal_question: new RunnablePassthrough(),
  },
  {
    context: retrievCombineDocsChain,
    question: (prevValues) => prevValues.orginal_question,
  },
  answerChain,
]);

// const chain = standalonePrompt
//   .pipe(hfTextGen)
//   .pipe(new StringOutputParser())
//   .pipe(retriever)
//   .pipe(combineDocs);

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
