import { absoluteUrl } from "./seo";

export type BlogPostSection = {
  title: string;
  body: string[];
};

export type BlogPostFaq = {
  question: string;
  answer: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  keywords: string[];
  highlights: string[];
  sections: BlogPostSection[];
  faq: BlogPostFaq[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "uk-tax-return-mistakes-sole-traders",
    title: "7 UK tax return mistakes sole traders can avoid before filing season",
    description:
      "A practical guide for UK sole traders on avoiding common self assessment tax return mistakes, reducing HMRC friction, and keeping better records before filing.",
    excerpt:
      "Late bookkeeping, weak expense evidence, and missed income checks are still the mistakes that slow down filings the most. This guide breaks down what to review before you submit your self assessment return.",
    category: "Self Assessment",
    readTime: "6 min read",
    publishedAt: "2026-03-10",
    updatedAt: "2026-03-18",
    author: "Accounts Assists",
    keywords: [
      "UK self assessment tax return tips",
      "sole trader tax return mistakes",
      "common self assessment errors",
      "HMRC filing checklist",
      "allowable business expenses UK",
      "tax return accountant for sole traders",
      "taxi driver tax return tips",
      "uber driver tax return London",
      "private hire vehicle tax returns",
      "self assessment for taxi drivers Watford",
    ],
    highlights: [
      "Separate business and personal spending before year-end reviews.",
      "Check invoices, mileage logs, and software subscriptions against your records.",
      "File early even if you need time to plan the final payment.",
    ],
    sections: [
      {
        title: "1. Waiting until the deadline to organise bookkeeping",
        body: [
          "The biggest filing mistake usually happens before the tax return starts: records are left untouched until January. That compresses months of bank activity, receipts, invoices, and questions into a few rushed days.",
          "A cleaner approach is to reconcile income and expenses earlier, identify missing documents, and flag anything unusual before filing season becomes urgent. That gives you time to correct issues instead of guessing under pressure.",
        ],
      },
      {
        title: "2. Mixing personal and business spending in the same trail",
        body: [
          "When personal purchases and business spending are mixed together, expense reviews take longer and the evidence becomes weaker. Sole traders should keep a clear transaction trail that shows why a cost was incurred for the business.",
          "If one account must be used for both, label transactions consistently and keep supporting receipts. That is especially important for fuel, phone costs, home office usage, travel, and subscriptions.",
        ],
      },
      {
        title: "3. Claiming expenses without enough supporting evidence",
        body: [
          "Allowable expenses can reduce the tax bill, but only when the supporting records are strong enough. Missing receipts, incomplete mileage notes, or vague card descriptions create unnecessary risk if HMRC ever asks questions.",
          "Before filing, review whether each material expense has a document, a date, a supplier, and a business purpose. The stronger the recordkeeping, the easier it is to defend legitimate claims.",
        ],
      },
      {
        title: "4. Forgetting side income, CIS, dividends, or platform earnings",
        body: [
          "Many taxpayers focus on their main trading income and forget secondary earnings that still affect the return. Construction Industry Scheme deductions, dividend income, bank interest, rental income, or platform payouts all need to be checked against the tax year.",
          "A final income reconciliation should compare your bookkeeping, bank entries, tax documents, and any third-party statements so the return is complete before submission.",
        ],
      },
      {
        title: "5. Treating capital purchases like day-to-day expenses",
        body: [
          "Equipment, laptops, tools, or business assets are not always treated the same way as routine running costs. Misclassifying them can distort the return and miss the most tax-efficient treatment.",
          "If you bought higher-value assets during the year, review them separately rather than pushing them into general expenses. That makes it easier to assess whether capital allowances apply.",
        ],
      },
      {
        title: "6. Filing late because payment planning feels unclear",
        body: [
          "Some sole traders delay filing because they are worried about the eventual payment. Filing and paying are linked, but they are not the same planning decision. Filing early gives you visibility on the liability, which usually makes payment planning easier.",
          "Earlier filing also reduces stress, avoids last-minute submission failures, and gives more time to discuss the position properly if cash flow is tight.",
        ],
      },
      {
        title: "7. Missing the value of a pre-submission review",
        body: [
          "A short review before submission often catches duplicated costs, omitted income, and weak explanations around unusual transactions. That is particularly valuable for first-time sole traders, taxi drivers, contractors, and anyone with mixed income sources.",
          "The goal is not just to file on time. It is to file accurately, support the numbers properly, and use the allowances available without creating avoidable risk.",
        ],
      },
    ],
    faq: [
      {
        question: "What is the most common self assessment mistake for sole traders?",
        answer:
          "The most common mistake is leaving bookkeeping until the last minute. That usually leads to missing documents, incomplete expense claims, and avoidable filing pressure.",
      },
      {
        question: "Can I file my tax return early even if I cannot pay immediately?",
        answer:
          "Yes. Filing early gives you a clear view of the liability and more time to prepare for payment, rather than waiting until the deadline to understand the number.",
      },
      {
        question: "Which records should a sole trader keep before filing?",
        answer:
          "You should keep income records, invoices, receipts, mileage logs, bank statements, software or subscription bills, and any documents covering dividends, CIS deductions, or other side income.",
      },
    ],
  },
];

export function getAllBlogPosts() {
  return BLOG_POSTS;
}

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getBlogPostPath(slug: string) {
  return `/blog/${slug}`;
}

export function getAbsoluteBlogPostUrl(slug: string) {
  return absoluteUrl(getBlogPostPath(slug));
}

export function formatBlogDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}
