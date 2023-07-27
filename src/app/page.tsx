import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import LogoutButton from "../components/logout-button";
import { Database } from "@/types/database";
import { redirect } from "next/navigation";
import { sendMessage } from "./_actions/send-message";
import RealtimeMessages from "@/components/realtime-messages";

export const dynamic = "force-dynamic";

export default async function Index() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const { data: messages } = await supabase.from("messages").select(`
  *,
  profiles (*)
`);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // This route can only be accessed by authenticated users.
    // Unauthenticated users will be redirected to the `/login` route.
    redirect("/login");
  }

  return (
    <div className="w-full">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm text-foreground">
          <div />
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                Hey, {user.email}!
                <LogoutButton />
              </div>
            ) : (
              <Link
                href="/login"
                className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="animate-in opacity-0 max-w-4xl px-3 text-foreground mx-auto">
        <div className="w-full h-[calc(100vh-140px)] overflow-y-auto px-4 py-6">
          {messages && (
            <RealtimeMessages currentUser={user} initialMessages={messages} />
          )}
        </div>

        <div className="w-full flex justify-center bg-slate-100 border-t border-slate-200 py-2 h-[65px]">
          <form className="w-full" action={sendMessage}>
            <input
              className="ring-1 ring-slate-200 rounded-md p-3 w-full"
              name="message"
              placeholder="Type a new message..."
            />
          </form>
        </div>
      </div>
    </div>
  );
}
