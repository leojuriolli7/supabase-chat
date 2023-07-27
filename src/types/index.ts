import { Database } from "./database";

export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type MessageWithAuthor = Message & {
  profiles: Profile | null;
};
