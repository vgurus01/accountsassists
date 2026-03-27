import type { Metadata } from "next";
import AboutSection from "./sections/AboutSection";
import BlogSection from "./sections/BlogSection";
import BookingSection from "./sections/BookingSection";
import ContactSection from "./sections/ContactSection";
import Footer from "./sections/Footer";
import Header from "./sections/Header";
import HeroSection from "./sections/HeroSection";
import { SERVICES } from "./lib/services";
import {
  HOME_TARGET_KEYWORDS,
  NICHE_SERVICE_TOPICS,
  SERVICE_AREAS,
  SITE_NAME,
  absoluteUrl,
  buildPageMetadata,
  getFullTitle,
  getSiteUrl,
} from "./lib/seo";
import ServicesSection from "./sections/ServicesSection";

const HOME_TITLE =
  "Accountant in Watford for Self Assessment, Bookkeeping & Payroll";
const HOME_DESCRIPTION =
  "Accountants in Watford serving Bushey, Croxley Green, Rickmansworth, Borehamwood, St Albans, Wembley, Harrow, Stanmore, Edgware, Kenton, Kingsbury, and Alperton. Get expert help with self assessment, taxi driver tax returns, bookkeeping, VAT, payroll, and company tax.";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  pathname: "/",
  keywords: [
    ...HOME_TARGET_KEYWORDS,
    "tax preparation services Watford",
    "accountant in Watford",
    "North London accountant",
    "taxi driver accountant London",
    "restaurant payroll accountant",
    "small business accountant Harrow",
  ],
  category: "Accounting Services",
  classification: "Accounting Services",
});

export default function Home() {
  const siteUrl = getSiteUrl();
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}/#webpage`,
    url: siteUrl,
    name: getFullTitle(HOME_TITLE),
    description: HOME_DESCRIPTION,
    inLanguage: "en-GB",
    isPartOf: {
      "@id": `${siteUrl}/#website`,
    },
    about: [
      "Tax preparation",
      "Bookkeeping",
      "Self assessment tax returns",
      "Company tax",
      "VAT returns",
      "Payroll services",
      "HMRC reporting",
      ...NICHE_SERVICE_TOPICS,
    ],
    keywords: HOME_TARGET_KEYWORDS.join(", "),
    primaryImageOfPage: absoluteUrl("/opengraph-image"),
    mainEntity: {
      "@id": `${siteUrl}/#accountingservice`,
    },
    hasPart: [
      {
        "@type": "WebPageElement",
        name: "Services",
        url: absoluteUrl("/#services"),
      },
      {
        "@type": "WebPageElement",
        name: "Blog",
        url: absoluteUrl("/blog"),
      },
      {
        "@type": "WebPageElement",
        name: "About",
        url: absoluteUrl("/#about"),
      },
      {
        "@type": "WebPageElement",
        name: "Booking",
        url: absoluteUrl("/#booking"),
      },
      {
        "@type": "WebPageElement",
        name: "Contact",
        url: absoluteUrl("/#contact"),
      },
    ],
    contentLocation: SERVICE_AREAS.map((location) => ({
      "@type": "Place",
      name: location,
    })),
  };

  const servicesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} services`,
    itemListElement: SERVICES.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl("/#services"),
      item: {
        "@type": "Service",
        name: service.name,
        description: service.summary,
        provider: {
          "@id": `${siteUrl}/#accountingservice`,
        },
        areaServed: "United Kingdom",
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <BlogSection />
        <AboutSection />
        <BookingSection />
        <ContactSection />
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />
    </div>
  );
}
