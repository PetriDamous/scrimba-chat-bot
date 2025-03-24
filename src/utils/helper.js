export const combineDocs = (docs) => {
  return docs.map((doc) => doc.pageContent).join(" ");
};
