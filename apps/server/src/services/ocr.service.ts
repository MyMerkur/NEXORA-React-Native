import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { env } from "../config/env";

export class OcrNotConfiguredError extends Error {}

const KycExtractionSchema = z.object({
  isLegible: z.boolean(),
  extractedFullName: z.string().nullable(),
  documentNumber: z.string().nullable(),
  nameMatchesUser: z.boolean(),
  confidence: z.enum(["low", "medium", "high"]),
  notes: z.string(),
});

export type KycExtraction = z.infer<typeof KycExtractionSchema>;

const KYC_EXTRACTION_JSON_SCHEMA = {
  type: "object",
  properties: {
    isLegible: { type: "boolean" },
    extractedFullName: { type: ["string", "null"] },
    documentNumber: { type: ["string", "null"] },
    nameMatchesUser: { type: "boolean" },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    notes: { type: "string" },
  },
  required: ["isLegible", "extractedFullName", "documentNumber", "nameMatchesUser", "confidence", "notes"],
  additionalProperties: false,
} as const;

interface AnalyzeKycDocumentParams {
  documentType: "kimlik" | "diploma" | "kurumsal_belge";
  contentType: string;
  fileBuffer: Buffer;
  expectedFullName: string;
}

const DOCUMENT_LABELS: Record<AnalyzeKycDocumentParams["documentType"], string> = {
  kimlik: "kimlik",
  diploma: "diploma",
  kurumsal_belge: "kurumsal belge (vergi levhası, ticaret sicil gazetesi vb.)",
};

const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);

export async function analyzeKycDocument(params: AnalyzeKycDocumentParams): Promise<KycExtraction> {
  if (!env.ANTHROPIC_API_KEY) {
    throw new OcrNotConfiguredError("ANTHROPIC_API_KEY yapılandırılmamış");
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const base64 = params.fileBuffer.toString("base64");
  const isPdf = params.contentType === "application/pdf";

  if (!isPdf && !SUPPORTED_IMAGE_TYPES.has(params.contentType)) {
    throw new Error(`Desteklenmeyen belge içerik tipi: ${params.contentType}`);
  }

  const documentBlock = isPdf
    ? ({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64 },
      } as const)
    : ({
        type: "image",
        source: { type: "base64", media_type: params.contentType as "image/jpeg" | "image/png", data: base64 },
      } as const);

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          documentBlock,
          {
            type: "text",
            text: `Bu bir "${DOCUMENT_LABELS[params.documentType]}" belgesidir. Belgeyi incele ve şunları değerlendir: belgedeki tam ad, belge numarası (varsa), belgenin okunaklı/geçerli olup olmadığı. Belgedeki adın "${params.expectedFullName}" ile eşleşip eşleşmediğini değerlendir (küçük yazım/Türkçe karakter farklılıkları kabul edilebilir).`,
          },
        ],
      },
    ],
    output_config: {
      format: { type: "json_schema", schema: KYC_EXTRACTION_JSON_SCHEMA },
    },
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("OCR yanıtında metin bulunamadı");
  }

  return KycExtractionSchema.parse(JSON.parse(textBlock.text));
}
