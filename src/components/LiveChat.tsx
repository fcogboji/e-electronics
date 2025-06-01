// Real-time Chat Component (using Clerk and Pusher)
// src/components/LiveChat.tsx
"use client";
import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { useUser } from "@clerk/nextjs";

export default function LiveChat() {
  const { user } = useUser();
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const pusher = new Pusher("303aa87a9066d95314c5", {
        cluster: "eu",
      });
      

    const channel = pusher.subscribe("chat-channel");
    channel.bind("new-message", (data: { message: string }) => {
      setMessages(prev => [...prev, data.message]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  const sendMessage = async () => {
    if (!input) return;
    await fetch("/api/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `${user?.fullName}: ${input}` }),
    });
    setInput("");
  };

  return (
    <div className="p-4 border rounded-lg max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-2">Live Chat</h2>
      <div className="h-64 overflow-y-auto border p-2 bg-gray-50 mb-2">
        {messages.map((msg, i) => (
          <p key={i} className="text-sm mb-1">{msg}</p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 border px-2 py-1"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-1 rounded">
          Send
        </button>
      </div>
    </div>
  );
}