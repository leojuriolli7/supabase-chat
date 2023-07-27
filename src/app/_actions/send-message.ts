"use server";
import type { Database } from "@/types/database";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const sendMessage = async (formData: FormData) => {
  const supabase = createServerActionClient<Database>({ cookies });
  const text = formData.get("message");

  if (text) {
    const { error } = await supabase.from("messages").insert({
      text: text.toString(),
    });

    if (error) {
      console.log("error:", error);
    }
  }
};
