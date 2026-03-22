export type ServiceId =
  | "accounting-bookkeeping"
  | "company-tax-vat"
  | "self-assessment"
  | "payroll";

export type Service = {
  id: ServiceId;
  name: string;
  summary: string;
  bullets: string[];
};

export const SERVICES: Service[] = [
  {
    id: "accounting-bookkeeping",
    name: "Accounting & Book-Keeping",
    summary:
      "Keep your financial records accurate and up-to-date without the hassle. We manage day-to-day transactions so you always have a clear picture of your financial health.",
    bullets: [
      "Day-to-day transaction management",
      "Accurate, up-to-date records",
      "Clear view of financial health",
    ],
  },
  {
    id: "company-tax-vat",
    name: "Company Tax & VAT",
    summary:
      "Navigate corporation tax and VAT returns with confidence. We keep you compliant while identifying opportunities for tax efficiency.",
    bullets: [
      "Corporation tax returns",
      "VAT registration & returns",
      "Tax efficiency opportunities",
    ],
  },
  {
    id: "self-assessment",
    name: "Self Assessment",
    summary:
      "Take the stress out of your tax return. We help individuals—including taxi drivers and contractors—file accurately and on time, maximising your potential refund.",
    bullets: [
      "Self-assessment tax returns",
      "Taxi drivers & contractors",
      "Accurate, on-time filing",
    ],
  },
  {
    id: "payroll",
    name: "Payroll",
    summary:
      "Simplify payroll. We handle salary calculations, deductions, HMRC reporting, and pension enrolments—so your team is paid correctly and on time, every time.",
    bullets: [
      "Salary calculations & deductions",
      "HMRC reporting",
      "Pension enrolments",
    ],
  },
];
