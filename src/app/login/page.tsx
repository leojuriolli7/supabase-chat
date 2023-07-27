"use client";

import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Login() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <form
        className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
        onSubmit={handleSignIn}
      >
        <button className="bg-blue-700 rounded px-4 py-2 text-white mb-6">
          Login with Github
        </button>
      </form>
    </div>
  );
}
