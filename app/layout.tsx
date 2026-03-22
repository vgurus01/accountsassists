import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SERVICES } from "./lib/services";
import { absoluteUrl, getSiteUrl } from "./lib/seo";

const SITE_NAME = "Accounts Assists";
const DEFAULT_TITLE = "Tax Preparation & Accounting Services";
const DEFAULT_DESCRIPTION =
  "UK tax preparation and accounting services for individuals, contractors, taxi drivers, and small businesses. Get a free, no-obligation consultation and expert guidance from a CIMA Certified professional.";

const KEYWORDS = [
  "accounting",
  "accounting services",
  "bookkeeping",
  "book-keeping",
  "bookkeeping services",
  "tax preparation",
  "tax return",
  "self assessment",
  "self assessment tax return",
  "company tax",
  "corporation tax",
  "VAT returns",
  "VAT registration",
  "payroll services",
  "HMRC reporting",
  "small business accounting",
  "sole trader accounting",
  "contractor accounting",
  "taxi driver tax return",
  "CIMA certified accountant",
  "UK accountant",
  "tax efficiency",
];

const BUSINESS_GEO = {
  latitude: 51.699947,
  longitude: -0.396249,
};

const MAP_URL =
  "https://www.openstreetmap.org/?mlat=51.699947&mlon=-0.396249#map=16/51.699947/-0.396249";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} | ${DEFAULT_TITLE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  keywords: KEYWORDS,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${DEFAULT_TITLE}`,
    description: DEFAULT_DESCRIPTION,
    locale: "en_GB",
    images: [{ url: absoluteUrl("/opengraph-image") }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${DEFAULT_TITLE}`,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl("/twitter-image")],
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
    shortcut: [{ url: "/favicon.ico" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const serviceOffers = SERVICES.map((service) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: service.name,
      description: service.summary,
      serviceType: service.name,
    },
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    "@id": `${getSiteUrl()}/#accountingservice`,
    name: SITE_NAME,
    url: getSiteUrl(),
    email: "info@accountsassists.com",
    telephone: "+447845420967",
    address: {
      "@type": "PostalAddress",
      streetAddress: "25 Robins Place, Boundry Way",
      addressLocality: "Watford",
      addressRegion: "Hertfordshire",
      postalCode: "WD25 7SL",
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS_GEO.latitude,
      longitude: BUSINESS_GEO.longitude,
    },
    hasMap: MAP_URL,
    areaServed: [
      {
        "@type": "Country",
        name: "United Kingdom",
      },
      {
        "@type": "City",
        name: "London",
      },
      {
        "@type": "City",
        name: "Watford",
      },
    ],
    serviceArea: [
      {
        "@type": "Country",
        name: "United Kingdom",
      },
      {
        "@type": "AdministrativeArea",
        name: "Greater London",
      },
      {
        "@type": "City",
        name: "Watford",
      },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: "+447845420967",
        email: "info@accountsassists.com",
        availableLanguage: ["en"],
      },
    ],
    knowsAbout: [
      "Tax preparation",
      "Self assessment tax returns",
      "Bookkeeping",
      "Company tax",
      "Corporation tax",
      "VAT returns",
      "Payroll",
      "HMRC reporting",
      "Small business accounting",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Accounting & Tax Services",
      itemListElement: serviceOffers,
    },
    founder: {
      "@type": "Person",
      name: "Susiri Padmakumara",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
