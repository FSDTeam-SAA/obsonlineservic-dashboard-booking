export const passwordRequirements = [
  { label: "At least 8 characters", test: (password: string) => password.length >= 8 },
  { label: "An uppercase letter", test: (password: string) => /[A-Z]/.test(password) },
  { label: "A lowercase letter", test: (password: string) => /[a-z]/.test(password) },
  { label: "A number", test: (password: string) => /\d/.test(password) },
  { label: "A symbol", test: (password: string) => /[^A-Za-z0-9]/.test(password) },
] as const;

export function hasStrongPassword(password: string) {
  return passwordRequirements.every((requirement) => requirement.test(password));
}
