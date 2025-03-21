import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { PromptTemplate } from "@langchain/core/prompts";

const hfApiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;

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

const standaloneQuestionChain = standalonePrompt.pipe(hfTextGen);

const result = await standaloneQuestionChain.invoke({
  question:
    "What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful. I really like playing Halo so maybe I can upgrade my latop to play Scrimba? I love turtles btw how do you feel about turtles?",
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
