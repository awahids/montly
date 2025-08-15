import type { Metadata } from "next";
import Script from "next/script";

import { Header } from "@/components/site/header";
import { Hero } from "@/components/marketing/hero";
import { TrustSignals } from "@/components/marketing/trust-signals";
import { Features } from "@/components/marketing/features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Pricing } from "@/components/marketing/pricing";
import { Testimonials } from "@/components/marketing/testimonials";
import { FAQ } from "@/components/marketing/faq";
import { CTABand } from "@/components/marketing/cta-band";
import { Footer } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Monli — Budget monthly, track daily",
  description:
    "Manage money across banks & e-wallets, set monthly budgets, and track daily transactions with Monli.",
  openGraph: {
    title: "Monli — Budget monthly, track daily",
    description:
      "Manage money across banks & e-wallets, set monthly budgets, and track daily transactions with Monli.",
    images: [
      {
        url: "https://placehold.co/1200x630/png?text=Monli",
        width: 1200,
        height: 630,
      },
    ],
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Monli",
    url: "https://monli.app",
    sameAs: ["https://twitter.com/monli", "https://github.com/monliapp"],
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Monli",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
  },
];

export default function LandingPage() {
  return (
    <>
      <Script
        src="https://analytics.umami.is/script.js"
        data-website-id="umami-landing"
        strategy="lazyOnload"
      />
      <Script
        id="json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(jsonLd)}
      </Script>
      <Header />
      <main className="pb-24">
        <Hero />
        <TrustSignals />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTABand />
      </main>
      <Footer />
    </>
  );
}
