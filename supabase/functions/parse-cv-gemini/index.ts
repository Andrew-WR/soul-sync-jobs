// Supabase Edge Function: parse-cv-gemini
// Securely analyzes a CV with Gemini 2.0 Flash and returns 0-10 scores for all categories

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CATEGORIES = [
  "Machine Learning Fundamentals",
  "Deep Learning Architectures",
  "Natural Language Processing",
  "Computer Vision",
  "Reinforcement Learning",
  "Data Engineering",
  "Data Visualization",
  "Feature Engineering",
  "Model Deployment & MLOps",
  "Cloud Platforms (AWS/Azure/GCP)",
  "Big Data Technologies",
  "Programming in Python",
  "Programming in R",
  "Programming in C++/Java",
  "Mathematics for ML (Linear Algebra, Calculus, Probability)",
  "Statistics & Hypothesis Testing",
  "Optimization Techniques",
  "Prompt Engineering",
  "AI Ethics & Fairness",
  "Research & Paper Implementation",
  "Experiment Design & A/B Testing",
  "Domain Expertise (e.g., healthcare, finance, robotics)",
  "Real-time Data Processing",
  "Team Collaboration Skills",
  "Communication of Technical Concepts",
  "Problem-solving & Critical Thinking",
  "Innovation & Experimentation Appetite",
  "Work Pace Preference (fast-paced higher value, steady lower value)",
  "Commitment to Continuous Learning",
];

function json(res: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(res), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, ...init });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) return json({ error: "Expect multipart/form-data with file" }, { status: 400 });

  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) return json({ error: "Missing GEMINI_API_KEY secret in Supabase" }, { status: 500 });

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return json({ error: "No file provided" }, { status: 400 });

    // Upload raw file bytes to Google AI File API
    const uploadRes = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "x-goog-upload-protocol": "raw",
          "x-goog-upload-file-name": file.name,
          "Content-Type": file.type || "application/octet-stream",
        },
        body: await file.arrayBuffer(),
      }
    );

    if (!uploadRes.ok) {
      const detail = await uploadRes.text();
      return json({ error: "Failed to upload file to Google AI File API", detail }, { status: 500 });
    }

    const uploaded = await uploadRes.json();
    const fileUri = uploaded?.file?.uri || uploaded?.file?.name;
    if (!fileUri) return json({ error: "Upload response missing file URI" }, { status: 500 });

    const prompt = `You are an expert resume assessor. Score the candidate strictly from 0-10 for EACH of the following categories. Return ONLY valid JSON with keys exactly as provided and numeric values (0-10). No prose, no markdown.
Categories:\n${CATEGORIES.join("\n")}\n
Output JSON format with ALL keys present:\n{\n${CATEGORIES.map((c) => `  \"${c}\": 0`).join(",\n")}\n}`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { file_data: { mime_type: file.type || "application/pdf", file_uri: String(fileUri) } },
          ],
        },
      ],
    };

    const genRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!genRes.ok) {
      const detail = await genRes.text();
      return json({ error: "Gemini call failed", detail }, { status: 500 });
    }

    const data = await genRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join("") ?? "";

    let parsed: Record<string, number> = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }

    // sanitize and fill all categories
    const result: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      const v = Number(parsed?.[cat] ?? 0);
      result[cat] = Math.max(0, Math.min(10, Number.isFinite(v) ? v : 0));
    }

    return json({ scores: result });
  } catch (e) {
    return json({ error: "Unhandled error", detail: String(e) }, { status: 500 });
  }
});
