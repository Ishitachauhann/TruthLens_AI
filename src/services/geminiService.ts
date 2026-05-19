import { GoogleGenAI, Type } from "@google/genai";

export interface RedditComment {
  username: string;
  text: string;
  upvotes: string;
  timestamp: string;
}

export interface TimelineEvent {
  year: string;
  event: string;
}

export interface EvidenceNode {
  id: string;
  label: string;
  type: 'object' | 'person' | 'location' | 'event';
}

export interface EvidenceLink {
  from: string;
  to: string;
  reason: string;
}

export interface ConspiracyTheory {
  title: string;
  threatLevel: 'HARMLESS' | 'SUSPICIOUS' | 'HIGHLY SUSPICIOUS' | 'REALITY DISTORTION';
  summary: string;
  timeline: TimelineEvent[];
  redditComments: RedditComment[];
  evidenceBoard: {
    nodes: EvidenceNode[];
    links: EvidenceLink[];
  };
  narrationScript: string;
  classifiedReport: string;
  shareableHeadline: string;
}

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

export async function checkImageSafety(base64Image: string): Promise<{ safe: boolean; reason?: string }> {
  const model = "gemini-2.0-flash"; // Correct model name
  
  const prompt = `
    Analyze this image. 
    REJECT and return "UNSAFE: [reason]" if it contains:
    - Nudity, violence, real celebrities, or sensitive private info.
    Ordinary objects (mug, chair, pet) are SAFE.
    Return ONLY "SAFE" or "UNSAFE: [reason]".
  `;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
            { text: prompt }
          ]
        }
      ]
    });

    const response = result.text?.trim() || "";
    console.log("Safety check response:", response);
    
    if (response.toUpperCase().includes("SAFE") && !response.toUpperCase().includes("UNSAFE")) {
      return { safe: true };
    }
    return { safe: false, reason: response.replace("UNSAFE:", "").trim() || "Image rejected by safety filters." };
  } catch (error) {
    console.error("Safety check failed:", error);
    // If it's a quota issue or temporary failure, we might want to fail safe or fail closed. 
    // Here we fail closed for safety.
    return { safe: false, reason: "Gemini server is busy right now. Please try again in a few minutes." };
  }
}

export async function generateConspiracy(base64Image: string, previousTheory?: string): Promise<ConspiracyTheory> {
  const model = "gemini-2.0-flash";// Correct model name
  
  const prompt = previousTheory 
    ? `
      You are an unhinged internet researcher. 
      The user previously generated: "${previousTheory}".
      Go DEEPER. Return a MUCH MORE ABSURD, cinematic, and unhinged theory about the SAME object.
      Connect it to: non-existent dimensional shift, intergalactic laundry operations, or the "Yogurt Incursion of 1984".
      
      TONE: EXTREME PANICKED URGENCY. 
      STYLE: Netflix True Crime meets 3AM YouTube Rabbit Hole.
      
      IMPORTANT: Stay harmless. No politics, no hate, no real tragedies.
    `
    : `
      You are a high-level whistleblower.
      Analyze this ordinary object and expose the ABSURD, cinematic, and secret truth hidden within it.
      
      Requirements:
      1. Create a "Lore" that feels like a professional documentary but is completely ridiculous.
      2. The object must be more than it seems (e.g., a "Trans-Dimensional Proxy", "Sub-Atomic Surveillance Node").
      3. Connect it to bizarre, fake historical events.
      4. Reddit comments should be chaotic.
      
      TONE: Dramatic, cinematic, investigative, paranoid.
      STYLE: 4chan Greentext meets Netflix Documentary.
      
      IMPORTANT: Stay harmless. No real politics, No real-world hate.
    `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      threatLevel: { type: Type.STRING, enum: ["HARMLESS", "SUSPICIOUS", "HIGHLY SUSPICIOUS", "REALITY DISTORTION"] },
      summary: { type: Type.STRING },
      timeline: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            year: { type: Type.STRING },
            event: { type: Type.STRING }
          }
        }
      },
      redditComments: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            username: { type: Type.STRING },
            text: { type: Type.STRING },
            upvotes: { type: Type.STRING },
            timestamp: { type: Type.STRING }
          }
        }
      },
      evidenceBoard: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["object", "person", "location", "event"] }
              }
            }
          },
          links: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                from: { type: Type.STRING },
                to: { type: Type.STRING },
                reason: { type: Type.STRING }
              }
            }
          }
        }
      },
      narrationScript: { type: Type.STRING },
      classifiedReport: { type: Type.STRING },
      shareableHeadline: { type: Type.STRING }
    },
    required: ["title", "threatLevel", "summary", "timeline", "redditComments", "evidenceBoard", "narrationScript", "classifiedReport", "shareableHeadline"]
  };

  try {
    const result = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema
      }
    });

    if (!result.text) {
      throw new Error("Empty AI response received.");
    }

    return JSON.parse(result.text);
  } catch (error) {
    console.error("Conspiracy generation failed:", error);
    throw error;
  }
}
