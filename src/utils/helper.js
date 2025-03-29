export const combineDocs = (docs) => {
  return docs.map((doc) => doc.pageContent).join(" ");
};

export const formatCovHistory = (messages) => {
  return messages
    .map((message, idx) => {
      if (idx % 2 === 0) {
        return `Human: ${message}`;
      } else {
        return `AI: ${message}`;
      }
    })
    .join("\n");
};
