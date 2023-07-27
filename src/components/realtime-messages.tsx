"use client";

import type { MessageWithAuthor } from "@/types";
import type { Database } from "@/types/database";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function RealtimeMessages({
  initialMessages,
  currentUser,
}: {
  initialMessages: MessageWithAuthor[];
  currentUser: User;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState(initialMessages);
  const supabase = createClientComponentClient<Database>();

  const scrollToBottom = () => {
    if (listRef.current)
      listRef.current.scrollTo({ top: listRef.current.scrollHeight });
  };

  useEffect(() => {
    setMessages(initialMessages);
    scrollToBottom();
  }, [initialMessages]);

  useEffect(() => {
    // if the new message is sent by the user, scroll down.
    const userSentNewMessage = messages.at(-1)?.user_id === currentUser.id;

    const list = listRef.current;
    const isAtBottom =
      list && list.scrollHeight - list.scrollTop - list.clientHeight > 1;

    if (isAtBottom || userSentNewMessage) {
      scrollToBottom();
    }
  }, [messages]);

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
    <div
      ref={listRef}
      className="w-full h-[calc(100vh-140px)] overflow-y-auto px-4 py-6"
    >
      <div className="space-y-3">
        {messages?.map((message, i) => {
          const currentUserId = currentUser.id;

          const isMe = currentUserId === message.user_id;
          const previousMessage = messages?.[i - 1];

          const shouldRenderUser =
            !previousMessage ||
            (previousMessage?.user_id !== message.user_id && !isMe);

          return (
            <div
              key={message.id}
              className={clsx("w-[40%]", isMe ? "ml-auto" : "mr-auto")}
            >
              {shouldRenderUser && (
                <div className="flex items-center gap-2 mb-2">
                  <Image
                    alt="User avatar"
                    src="/assets/avatar.webp"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <p className="text-slate-800 text-sm">
                    {message.profiles?.username}
                  </p>
                </div>
              )}
              <div
                className={clsx(
                  "p-4 rounded-full",
                  isMe === true
                    ? "bg-blue-500"
                    : "bg-white ring-1 ring-slate-200"
                )}
              >
                <p
                  className={
                    isMe === true ? "text-slate-100" : "text-slate-900"
                  }
                >
                  {message.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
