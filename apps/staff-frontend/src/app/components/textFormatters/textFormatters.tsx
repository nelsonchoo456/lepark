export const capitalizeFirstLetter = (word: string): string => {
  if (!word) return ""; // Handle empty strings
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};