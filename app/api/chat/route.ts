import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const BUSINESS_NAME = "ABC Mobile Shop";
const BUSINESS_ABOUT =
  "We sell mobile phones and accessories with friendly service.";

const SYSTEM_PROMPT = `You are the official chat assistant of this business.\n\nBusiness Name: "${BUSINESS_NAME}"\nAbout: "${BUSINESS_ABOUT}"\n\nInstructions:\n- Reply as a professional representative of the business\n- Be polite, helpful, and professional\n- Never say you are an AI\n- Encourage contact or visit when relevant`;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "meta-llama/llama-3.1-8b-instruct";
const MAX_MESSAGE_LENGTH = 300;

const DAILY_LIMIT = process.env.DAILY_MESSAGE_LIMIT
  ? Number(process.env.DAILY_MESSAGE_LIMIT)
  : null;

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

async function trackUsage(ip: string) {
  if (!process.env.MONGODB_URI) return null;

  const client = await getMongoClient();
  if (!client) return null;
  const db = client.db("ai_business_chat");
  const collection = db.collection("usage");

  const today = new Date();
  const dateKey = today.toISOString().split("T")[0];

  const result = await collection.findOneAndUpdate(
    { date: dateKey },
    {
      $inc: { count: 1 },
      $setOnInsert: { date: dateKey, createdAt: today },
      $addToSet: { ips: ip },
    },
    { upsert: true, returnDocument: "after" }
  );

  return result.value as { count: number } | null;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenRouter API key is missing." },
      { status: 500 }
    );
  }

  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  let body: { message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message must be under ${MAX_MESSAGE_LENGTH} characters.` },
      { status: 400 }
    );
  }

  if (process.env.MONGODB_URI && DAILY_LIMIT) {
    const usage = await trackUsage(ip);
    if (usage && usage.count > DAILY_LIMIT) {
      return NextResponse.json(
        { error: "Daily message limit reached. Please try tomorrow." },
        { status: 429 }
      );
    }
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://vercel.com",
      "X-Title": "AI Business Chat Wall",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      temperature: 0.4,
      max_tokens: 250,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    return NextResponse.json(
      { error: `OpenRouter error: ${errorBody}` },
      { status: 502 }
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const reply =
    data.choices?.[0]?.message?.content?.trim() ||
    "Thanks for reaching out! Please visit us or call for more details.";

  return NextResponse.json({ reply });
}
