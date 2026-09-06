import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "15mb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SatyaScan AI backend is running",
  });
});

app.get("/api/ai-test", async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: "Respond with exactly: SatyaScan AI connection successful",
    });

    res.json({
      success: true,
      message: response.text,
    });
  } catch (error) {
    console.error("Gemini API error:", error);

    res.status(500).json({
      success: false,
      error: "Gemini API request failed",
    });
  }
});

app.post("/api/ai-compliance", async (req, res) => {
  try {
    const { image, ocrText, extractedData } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: "Inspection image is required",
      });
    }

    if (!image.startsWith("data:image/")) {
      return res.status(400).json({
        success: false,
        error: "Image must be provided as a data URL",
      });
    }

    const [header, base64Data] = image.split(",");

    if (!base64Data) {
      return res.status(400).json({
        success: false,
        error: "Invalid image data",
      });
    }

    const mimeType =
      header.match(/data:(.*);base64/)?.[1] ||
      "image/jpeg";

    const prompt = `
You are the AI compliance analysis engine for SatyaScan, an
AI-assisted packaged-commodity inspection system.

Analyze the provided product/package image together with the OCR
text and extracted declarations.

Your task is to identify visible mandatory packaged-commodity
declarations and assess whether the available evidence appears
compliant.

IMPORTANT:
- Use the actual package image as visual evidence.
- Cross-check the image against the OCR text.
- Do not blindly trust OCR or extracted values.
- If a declaration cannot be confidently verified, return REVIEW.
- Do not invent values that are not visible or supported.
- This is an AI-assisted inspection prototype, not a legal
  certification or final enforcement decision.

Evaluate, where applicable:
1. Manufacturer / packer / importer details
2. Product/common name
3. Net quantity
4. MRP inclusive of applicable taxes
5. Manufacturing/packing date
6. Best-before/use-by/expiry information where applicable
7. Batch/lot number where visible
8. Consumer care contact details
9. Country of origin where applicable

For every finding return:
- field
- detectedValue
- status: PASS, FAIL, or REVIEW
- reason
- ruleReference
- evidence
- confidence from 0 to 100

Return ONLY valid JSON in this exact structure:

{
  "overallStatus": "COMPLIANT",
  "summary": "short overall assessment",
  "confidence": 0,
  "findings": [
    {
      "field": "netQuantity",
      "detectedValue": "236 ml",
      "status": "PASS",
      "reason": "short explanation",
      "ruleReference": "PCR Rule 6",
      "evidence": "what was observed in the package image",
      "confidence": 90
    }
  ]
}

Possible overallStatus values:
- COMPLIANT
- NON-COMPLIANT
- REVIEW_PENDING

OCR TEXT:
${ocrText || "No OCR text available"}

EXTRACTED DECLARATIONS:
${JSON.stringify(extractedData || {}, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text;

    if (!rawText) {
      throw new Error("Gemini returned an empty response");
    }

    const aiResult = JSON.parse(rawText);

    return res.json({
      success: true,
      result: aiResult,
    });
  } catch (error) {
    console.error("AI compliance error:", error);

    return res.status(500).json({
      success: false,
      error: "AI compliance analysis failed",
      details:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
});

// const PORT = 3001;

// app.listen(PORT, () => {
//   console.log(`SatyaScan AI server running on http://localhost:${PORT}`);
// });

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SatyaScan AI server running on port ${PORT}`);
});