// src/pages/api/send-message.ts
// @ts-ignore
import Pusher from "pusher";

import { NextApiRequest, NextApiResponse } from "next";

const pusher = new Pusher({
    appId: "1994171",
    key: "303aa87a9066d95314c5",
    secret: "8f4d373dc1a93f10eb49",
    cluster: "eu",
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
