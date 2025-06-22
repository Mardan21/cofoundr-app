export const validateLinkedInUrl = (url: string): boolean => {
  const linkedInRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
  return linkedInRegex.test(url);
};

export const validateGitHubUsername = (username: string): boolean => {
  const githubRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
  return githubRegex.test(username);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};