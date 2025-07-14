export const ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.USER]: "user",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
