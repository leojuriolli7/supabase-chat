"use client";

import type { MessageWithAuthor } from "@/types";
import type { Database } from "@/types/database";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import clsx from "clsx";
import { useEffect, useState } from "react";

export default function RealtimeMessages({
  initialMessages,
  currentUser,
}: {
  initialMessages: MessageWithAuthor[];
  currentUser: User;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const channel = supabase
      .channel("*")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const newMessage = payload.new as MessageWithAuthor;

          const { data: author } = await supabase
            .from("profiles")
            .select()
            .eq("id", newMessage.user_id)
            .single();

          newMessage.profiles = author;

          if (!messages.find((m) => m.id === newMessage.id)) {
            setMessages([...messages, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, messages, setMessages]);

  return (
    <div className="space-y-3">
      {messages?.map((message, i) => {
        const currentUserId = currentUser.id;

        const isMe = currentUserId === message.user_id;
        const previousMessage = messages?.[i - 1];

        const shouldRenderAvatar =
          !!previousMessage &&
          previousMessage?.user_id === currentUserId &&
          !isMe;

        return (
          <div
            key={message.id}
            className={clsx("w-1/2", isMe ? "ml-auto" : "mr-auto")}
          >
            {shouldRenderAvatar && (
              <p className="text-slate-800 text-sm mb-1">
                {message.profiles?.username}
              </p>
            )}
            <div
              className={clsx(
                "p-4 rounded-full",
                isMe === true ? "bg-blue-500" : "bg-white ring-1 ring-slate-200"
              )}
            >
              <p
                className={isMe === true ? "text-slate-100" : "text-slate-900"}
              >
                {message.text}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
