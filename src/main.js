import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import retriever from "./utils/retriever.js";
import { combineDocs, formatCovHistory } from "./utils/helper.js";

const hfApiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;

const hfTextGen = new HuggingFaceInference({
  model: "meta-llama/Llama-3.2-1B",
  temperature: 0.7,
  maxTokens: 200,
  apiKey: hfApiKey,
});

const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question. 
conversation history: {conv_history}
question: {question} 
standalone question:
`;

const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba based on the context provided and the conversation history. Try to find the answer in the context. If the answer is not given in the context, find the answer in the conversation history if possible. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@scrimba.com. Don't try to make up an answer. Always speak as if you were chatting to a friend.
context: {context}
conversation history: {conv_history}
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
    orginal_input: new RunnablePassthrough(),
  },
  {
    context: retrievCombineDocsChain,
    question: (prevValues) => prevValues.orginal_input.question,
    conv_history: (prevValues) => prevValues.orginal_input.conv_history,
  },
  answerChain,
]);

document.addEventListener("submit", (e) => {
  e.preventDefault();
  progressConversation();
});

const convHistory = [];

async function progressConversation() {
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
  const response = await chain.invoke({
    question: question,
    conv_history: formatCovHistory(convHistory), // You can pass the conversation history if needed
  });

  convHistory.push(question); // Add the question to the conversation history
  convHistory.push(response); // Add the response to the conversation history

  // add AI message
  const newAiSpeechBubble = document.createElement("div");
  newAiSpeechBubble.classList.add("speech", "speech-ai");
  chatbotConversation.appendChild(newAiSpeechBubble);
  newAiSpeechBubble.textContent = response;
  chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
}
