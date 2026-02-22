// src/pages/api/send-message.ts
// @ts-ignore
import Pusher from "pusher";

import { NextApiRequest, NextApiResponse } from "next";

// Validate Pusher environment variables
const pusherAppId = process.env.PUSHER_APP_ID;
const pusherKey = process.env.PUSHER_KEY;
const pusherSecret = process.env.PUSHER_SECRET;
const pusherCluster = process.env.PUSHER_CLUSTER || "eu";

if (!pusherAppId || !pusherKey || !pusherSecret) {
  console.error("Missing Pusher environment variables");
}

const pusher = new Pusher({
    appId: pusherAppId || "",
    key: pusherKey || "",
    secret: pusherSecret || "",
    cluster: pusherCluster,
    useTLS: true,
  });
  

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  await pusher.trigger("chat-channel", "new-message", { message });

  res.status(200).json({ success: true });
}
