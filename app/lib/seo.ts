import type { Metadata } from "next";

export const FALLBACK_SITE_URL = "https://accountsassists.com";
export const SITE_NAME = "Accounts Assists";
export const DEFAULT_PAGE_TITLE = "Tax Preparation & Accounting Services";
export const DEFAULT_DESCRIPTION =
  "Accounting and tax services in Watford, Wembley, Harrow, and across North London for individuals, taxi drivers, contractors, restaurants, and small businesses. Get expert support with self assessment, bookkeeping, VAT, payroll, and company tax.";
export const DEFAULT_OG_IMAGE_PATH = "/opengraph-image";
export const DEFAULT_TWITTER_IMAGE_PATH = "/twitter-image";
export const DEFAULT_OG_IMAGE_ALT =
  "Accounts Assists accounting and tax services";
export const BUSINESS_PHONE = "+447845420967";
export const BUSINESS_EMAIL = "info@accountsassists.com";
export const FOUNDER_NAME = "Susiri Padmakumara";
export const GOOGLE_SITE_VERIFICATION = "-sK_1hPODg4xkCQ2NiDZVE9XiPIudbuatta3x3OPWPs";
export const SOCIAL_PROFILES = [
  "https://www.facebook.com/accountsassists?locale=en_GB",
  "https://share.google/vbNX8zX8AyTp1eydP",
];
export const SERVICE_AREAS = [
  "Watford",
  "Bushey",
  "Croxley Green",
  "Rickmansworth",
  "Borehamwood",
  "St Albans",
  "Wembley",
  "Harrow",
  "Stanmore",
  "Edgware",
  "Kenton",
  "Kingsbury",
  "Alperton",
];
export const HOME_TARGET_KEYWORDS = [
  "self assessment accountant Watford",
  "self assessment for taxi drivers Watford",
  "uber driver tax return London",
  "tax accountant for cab drivers Harrow",
  "private hire vehicle tax returns",
  "tax deductions for taxi drivers",
  "self employed taxi driver accountant near me",
  "black cab accountant Wembley",
  "company tax returns London",
  "VAT filing services North London",
  "bookkeeping for small businesses Harrow",
  "payroll services for restaurants",
  "Sri Lankan taxi driver tax returns",
  "Tamil accountant for Uber drivers",
  "Asian self assessment specialist Watford",
  "Sinhalese speaking tax advisor for cabbies",
];
export const NICHE_SERVICE_TOPICS = [
  "Self assessment for taxi drivers",
  "Uber driver tax returns",
  "Private hire vehicle tax returns",
  "Tax deductions for taxi drivers",
  "Company tax returns",
  "VAT filing services",
  "Bookkeeping for small businesses",
  "Payroll services for restaurants",
];
export const BUSINESS_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const BUSINESS_ADDRESS = {
  streetAddress: "25 Robins Place, Boundry Way",
  addressLocality: "Watford",
  addressRegion: "Hertfordshire",
  postalCode: "WD25 7SL",
  addressCountry: "GB",
};

export const BUSINESS_GEO = {
  latitude: 51.699947,
  longitude: -0.396249,
  regionCode: "GB-HRT",
  placename: "Watford",
};

export const DEFAULT_KEYWORDS = [
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
  "taxi driver accountant",
  "uber driver tax return",
  "private hire vehicle tax returns",
  "CIMA certified accountant",
  "UK accountant",
  "tax efficiency",
  "accounting blog",
  "tax blog UK",
  "self assessment guide",
  "HMRC deadline advice",
  "North London accountant",
  "Watford accountant",
];

export const BUSINESS_META_TAGS = {
  "geo.region": BUSINESS_GEO.regionCode,
  "geo.placename": BUSINESS_GEO.placename,
  "geo.position": `${BUSINESS_GEO.latitude};${BUSINESS_GEO.longitude}`,
  ICBM: `${BUSINESS_GEO.latitude}, ${BUSINESS_GEO.longitude}`,
  "business:contact_data:street_address": BUSINESS_ADDRESS.streetAddress,
  "business:contact_data:locality": BUSINESS_ADDRESS.addressLocality,
  "business:contact_data:region": BUSINESS_ADDRESS.addressRegion,
  "business:contact_data:postal_code": BUSINESS_ADDRESS.postalCode,
  "business:contact_data:country_name": "United Kingdom",
};

type PageMetadataInput = {
  title: string;
  description: string;
  pathname: string;
  keywords?: string[];
  category?: string;
  classification?: string;
  openGraphType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  imagePath?: string;
  imageAlt?: string;
};

export function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    FALLBACK_SITE_URL;
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(pathname: string) {
  return new URL(pathname, getSiteUrl()).toString();
}

export function getFullTitle(title: string) {
  return `${title} | ${SITE_NAME}`;
}

function getCanonicalPath(pathname: string) {
  if (pathname === "/") return pathname;
  const normalized = pathname.replace(/\/+$/, "");
  return normalized || "/";
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function buildPageMetadata({
  title,
  description,
  pathname,
  keywords = [],
  category = "Accounting Services",
  classification = "Accounting Services",
  openGraphType = "website",
  publishedTime,
  modifiedTime,
  authors = [SITE_NAME],
  imagePath = DEFAULT_OG_IMAGE_PATH,
  imageAlt = DEFAULT_OG_IMAGE_ALT,
}: PageMetadataInput): Metadata {
  const canonical = getCanonicalPath(pathname);
  const fullTitle = getFullTitle(title);
  const mergedKeywords = uniqueStrings([...DEFAULT_KEYWORDS, ...keywords]);
  const mergedAuthors = uniqueStrings(authors);
  const openGraphImage = {
    url: absoluteUrl(imagePath),
    alt: imageAlt,
  };
  const twitterImage = {
    url: absoluteUrl(DEFAULT_TWITTER_IMAGE_PATH),
    alt: imageAlt,
  };

  if (openGraphType === "article") {
    return {
      title,
      description,
      alternates: { canonical },
      keywords: mergedKeywords,
      authors: mergedAuthors.map((name) => ({ name })),
      creator: FOUNDER_NAME,
      publisher: SITE_NAME,
      referrer: "origin-when-cross-origin",
      category,
      classification,
      formatDetection: {
        telephone: false,
        email: false,
        address: false,
      },
      openGraph: {
        type: "article",
        url: canonical,
        siteName: SITE_NAME,
        title: fullTitle,
        description,
        locale: "en_GB",
        countryName: "United Kingdom",
        emails: [BUSINESS_EMAIL],
        phoneNumbers: [BUSINESS_PHONE],
        images: [openGraphImage],
        publishedTime,
        modifiedTime,
        authors: mergedAuthors,
        section: category,
        tags: mergedKeywords,
      },
      twitter: {
        card: "summary_large_image",
        title: fullTitle,
        description,
        images: [twitterImage],
      },
      other: BUSINESS_META_TAGS,
    };
  }

  return {
    title,
    description,
    alternates: { canonical },
    keywords: mergedKeywords,
    authors: mergedAuthors.map((name) => ({ name })),
    creator: FOUNDER_NAME,
    publisher: SITE_NAME,
    referrer: "origin-when-cross-origin",
    category,
    classification,
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      locale: "en_GB",
      countryName: "United Kingdom",
      emails: [BUSINESS_EMAIL],
      phoneNumbers: [BUSINESS_PHONE],
      images: [openGraphImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [twitterImage],
    },
    other: BUSINESS_META_TAGS,
  };
}
