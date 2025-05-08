// types.ts

export type Note = {
  id: string;
  title: string;
  description: string;
  created_at: string;       // ISO date string
  updated_at: string;       // ISO date string
  user_firstname: string | null; // Can be null if user data is missing
};
