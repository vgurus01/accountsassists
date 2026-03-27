import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { SERVICES } from "./lib/services";
import {
  absoluteUrl,
  BUSINESS_ADDRESS,
  BUSINESS_DAYS,
  BUSINESS_EMAIL,
  BUSINESS_GEO,
  BUSINESS_META_TAGS,
  BUSINESS_PHONE,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_PAGE_TITLE,
  FOUNDER_NAME,
  GOOGLE_SITE_VERIFICATION,
  HOME_TARGET_KEYWORDS,
  NICHE_SERVICE_TOPICS,
  SERVICE_AREAS,
  SITE_NAME,
  SOCIAL_PROFILES,
  getFullTitle,
  getSiteUrl,
} from "./lib/seo";

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
    default: getFullTitle(DEFAULT_PAGE_TITLE),
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: getSiteUrl() }, { name: FOUNDER_NAME }],
  creator: FOUNDER_NAME,
  publisher: SITE_NAME,
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  keywords: DEFAULT_KEYWORDS,
  category: "Accounting Services",
  classification: "Accounting Services",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
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
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: getFullTitle(DEFAULT_PAGE_TITLE),
    description: DEFAULT_DESCRIPTION,
    locale: "en_GB",
    countryName: "United Kingdom",
    emails: [BUSINESS_EMAIL],
    phoneNumbers: [BUSINESS_PHONE],
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        alt: DEFAULT_OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: getFullTitle(DEFAULT_PAGE_TITLE),
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: absoluteUrl("/twitter-image"),
        alt: DEFAULT_OG_IMAGE_ALT,
      },
    ],
  },
  icons: {
    icon: [{ url: "/LogoAA.png" }],
    shortcut: [{ url: "/LogoAA.png" }],
  },
  other: BUSINESS_META_TAGS,
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
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${getSiteUrl()}/#website`,
        url: getSiteUrl(),
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        inLanguage: "en-GB",
        publisher: {
          "@id": `${getSiteUrl()}/#accountingservice`,
        },
      },
      {
        "@type": "AccountingService",
        "@id": `${getSiteUrl()}/#accountingservice`,
        name: SITE_NAME,
        url: getSiteUrl(),
        description: DEFAULT_DESCRIPTION,
        email: BUSINESS_EMAIL,
        telephone: BUSINESS_PHONE,
        image: absoluteUrl("/opengraph-image"),
        sameAs: SOCIAL_PROFILES,
        address: {
          "@type": "PostalAddress",
          ...BUSINESS_ADDRESS,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: BUSINESS_GEO.latitude,
          longitude: BUSINESS_GEO.longitude,
        },
        hasMap: MAP_URL,
        priceRange: "££",
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: BUSINESS_DAYS,
            opens: "09:00",
            closes: "21:00",
          },
        ],
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
          ...SERVICE_AREAS.map((location) => ({
            "@type": "Place",
            name: location,
          })),
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
          ...SERVICE_AREAS.map((location) => ({
            "@type": "Place",
            name: location,
          })),
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer service",
            telephone: BUSINESS_PHONE,
            email: BUSINESS_EMAIL,
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
          ...NICHE_SERVICE_TOPICS,
          ...HOME_TARGET_KEYWORDS,
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Accounting & Tax Services",
          itemListElement: serviceOffers,
        },
        subjectOf: {
          "@type": "Blog",
          name: "Accounts Assists Blog",
          url: `${getSiteUrl()}/blog`,
        },
        founder: {
          "@type": "Person",
          name: FOUNDER_NAME,
        },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
