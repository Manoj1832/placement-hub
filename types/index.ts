import { Doc } from "../convex/_generated/dataModel";

export type Experience = Doc<"experiences">;
export type User = Doc<"users">;
export type Document = Doc<"documents">;
export type Resource = Doc<"resources">;
export type Order = Doc<"orders">;
export type ServiceBooking = Doc<"serviceBookings">;
export type SavedExperience = Doc<"savedExperiences">;
export type Vote = Doc<"votes">;
export type Report = Doc<"reports">;

export type UserRole = User["role"];
export type OpportunityType = Experience["opportunityType"];
export type Difficulty = Experience["difficulty"];
export type ExperienceStatus = Experience["status"];
export type DocType = Document["docType"];
export type ResourceType = Resource["type"];
export type PaymentStatus = Order["paymentStatus"];
export type BookingStatus = ServiceBooking["bookingStatus"];

export interface ExperienceFormData {
  companyName: string;
  roleTitle: string;
  opportunityType: OpportunityType;
  branch: string;
  cgpaNote?: string;
  year: number;
  month: number;
  oaDetails?: string;
  round1?: string;
  round2?: string;
  round3?: string;
  hrRound?: string;
  questionsAsked: string[];
  tips: string;
  difficulty: Difficulty;
  isAnonymous: boolean;
}

export interface PricingItem {
  name: string;
  price: number;
  productType: string;
}
