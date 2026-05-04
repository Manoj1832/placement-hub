import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatMonthYear(year: number, month: number): string {
  const d = new Date(year, month - 1);
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "long" });
}

export const PRICING = {
  premium_yearly: { name: "Premium Yearly", price: 99, productType: "premium_yearly" as const },
  starter_kit: { name: "Placement Starter Kit", price: 99, productType: "starter_kit" as const },
  resume_review: { name: "Resume Review", price: 299, productType: "resume_review" as const },
  github_audit: { name: "GitHub Audit", price: 599, productType: "github_audit" as const },
  portfolio_audit: { name: "Portfolio Audit", price: 799, productType: "portfolio_audit" as const },
  company_pack: { name: "Company Pack", price: 199, productType: "company_pack" as const },
};

export const OPPORTUNITY_TYPES = ["internship", "fulltime"] as const;
export const BRANCHES = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "EXTC"] as const;
export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
