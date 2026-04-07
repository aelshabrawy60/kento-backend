// src/utils/formatZodError.js
export const formatZodError = (error) => {
  const formatted = {};

  error.errors.forEach((err) => {
    const field = err.path.join(".");
    if (!formatted[field]) {
      formatted[field] = [];
    }
    formatted[field].push(err.message);
  });

  return formatted;
};