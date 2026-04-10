// types/database.types.ts
// Auto-generate with: npx supabase gen types typescript --project-id <your-project-id> > types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Database {
  public: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Tables: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Views: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Functions: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Enums: Record<string, any>;
  };
}
