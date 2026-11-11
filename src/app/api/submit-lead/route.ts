import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { buyerInputSchema } from "@/lib/validation";
import { processLead } from "@/lib/engine";
import { buildCrmPayload, sendToCrm } from "@/lib/crm";
import { sendCapiLead } from "@/lib/metaCapi";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  const parsed = buyerInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Il manque quelques informations avant de pouvoir générer ton résultat.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const input = parsed.data;
  const leadId = randomUUID();

  try {
    const { result } = await processLead(input);

    // Pas de seuil "trop petit" : un premier acheteur qui termine le
    // questionnaire vaut toujours un suivi de Kevin, peu importe le verdict.
    const crmPayload = buildCrmPayload(input, result.decision);
    const meta = readMetaFields(body);
    const [crm] = await Promise.all([
      sendToCrm(crmPayload),
      // Meta Conversions API — Lead serveur, dédupliqué avec le pixel
      // navigateur via le même eventId.
      sendCapiLead({
        eventId: meta.eventId,
        email: input.email,
        phone: input.phone,
        firstName: input.firstName,
        lastName: input.lastName,
        fbc: meta.fbc,
        fbp: meta.fbp,
        clientIp: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
        sourceUrl: meta.sourceUrl,
        customData: { content_name: "Taux fixe ou variable - premier acheteur" },
      }),
    ]);
    if (!crm.ok) {
      console.error(crm.error);
    }

    return NextResponse.json({
      success: true,
      leadId,
      resultUrl: `/results/${leadId}`,
      result,
    });
  } catch (e) {
    console.error("LEAD_PROCESSING_FAILED", e);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue. Réessaie dans un instant." },
      { status: 500 }
    );
  }
}

// Champs d'attribution Meta envoyés par le navigateur (hors schéma du lead).
function readMetaFields(body: unknown): { eventId?: string; fbc?: string; fbp?: string; sourceUrl?: string } {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" && v.length > 0 && v.length < 500 ? v : undefined);
  return { eventId: str(b.eventId), fbc: str(b.fbc), fbp: str(b.fbp), sourceUrl: str(b.sourceUrl) };
}
