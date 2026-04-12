export const ideaSearchableFields = [
  "title",
  "description",
  "problemStatement",
  "solution",
];

export const ideaFilterableFields = [
  "searchTerm",
  "categoryId",
  "isPaid",
  "status",
];

export const ideaIncludeConfig = {
  votes: true,
  comments: true,
  payments: true,
};
