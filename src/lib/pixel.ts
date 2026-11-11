// Meta (Facebook) Pixel côté client.
// « Pixel de Kevin » (compte pub Facebook_Ads_Kevin_Peris), remplaçable par
// NEXT_PUBLIC_META_PIXEL_ID.
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1388001303411655";

type Fbq = (
  action: "track" | "trackCustom",
  event: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string }
) => void;

/**
 * Déclenche un événement Pixel en toute sécurité (no-op côté serveur ou si le
 * script n'est pas chargé). `eventId` sert à dédupliquer avec l'envoi serveur
 * (Conversions API, voir lib/metaCapi.ts).
 */
export function trackPixel(event: string, params?: Record<string, unknown>, eventId?: string): void {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq === "function") {
    fbq("track", event, params ?? {}, eventId ? { eventID: eventId } : undefined);
  }
}

function readCookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : undefined;
}

/**
 * Données d'attribution Meta à transmettre au serveur avec le lead :
 * cookies _fbc/_fbp (ou _fbc reconstruit à partir d'un fbclid dans l'URL).
 */
export function getMetaAttribution(): { fbc?: string; fbp?: string; sourceUrl?: string } {
  if (typeof window === "undefined") return {};
  try {
    let fbc = readCookie("_fbc");
    const fbp = readCookie("_fbp");
    if (!fbc) {
      const fbclid =
        new URLSearchParams(window.location.search).get("fbclid") ??
        sessionStorage.getItem("fbclid") ??
        undefined;
      if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
    }
    return { fbc, fbp, sourceUrl: window.location.href };
  } catch {
    return {};
  }
}

/** Mémorise le fbclid de l'URL d'arrivée (il disparaît après navigation). */
export function rememberFbclid(): void {
  if (typeof window === "undefined") return;
  try {
    const fbclid = new URLSearchParams(window.location.search).get("fbclid");
    if (fbclid) sessionStorage.setItem("fbclid", fbclid);
  } catch {
    /* stockage indisponible */
  }
}
