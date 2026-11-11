import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { META_PIXEL_ID } from "@/lib/pixel";

export const metadata: Metadata = {
  title: "Taux fixe ou variable pour ton premier achat? · Kevin Péris",
  description:
    "Taux fixe ou variable : lequel choisir pour ton premier achat? Découvre ton profil de risque en quelques questions — analyse gratuite et personnalisée par Kevin Péris, courtier hypothécaire chez Multi-Prêts Hypothèques.",
};

// Pixel Meta « Pixel de Kevin » (1388001303411655, compte pub
// Facebook_Ads_Kevin_Peris) — codé par défaut, NEXT_PUBLIC_META_PIXEL_ID peut
// le remplacer. Clarity : ne s'injecte que si NEXT_PUBLIC_CLARITY_ID est défini.
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA">
      <body className="font-sans antialiased">
        {CLARITY_ID && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${CLARITY_ID}");`}
          </Script>
        )}

        {META_PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
