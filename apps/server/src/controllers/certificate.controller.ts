import type { Request, Response, NextFunction } from "express";
import { verifyCertificate } from "../services/certificate.service";

function renderHtml(result: Awaited<ReturnType<typeof verifyCertificate>>): string {
  if (!result.valid) {
    return "<html><body><p>❌ Geçersiz veya bulunamayan sertifika.</p></body></html>";
  }
  const issuedDate = result.issuedAt ? new Date(result.issuedAt).toLocaleDateString("tr-TR") : "";
  return `<html><body><p>✅ Geçerli sertifika: ${result.participantName} — ${result.courseTitle} — ${issuedDate} (Eğitmen: ${result.instructorName})</p></body></html>`;
}

export async function verifyCertificateHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await verifyCertificate(req.params.code!);

    if (req.accepts(["json", "html"]) === "html") {
      res.status(200).type("html").send(renderHtml(result));
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
