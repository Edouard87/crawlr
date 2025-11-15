/**
 * Firebase Firestore Schema Definitions
 * 
 * This file contains TypeScript interfaces and example data structures
 * for the BarCrawler application's Firestore collections.
 */

import { Timestamp } from "firebase/firestore";

// ============================================================================
// User Schema
// ============================================================================

export interface User {
  id: string; // Document ID
  email: string;
  displayName: string;
  // Role determine what the user can access.
  role: "coordinator" | "participant" | "admin";
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// ============================================================================
// Bar Schema
// ============================================================================

export interface Bar {
  id: string; // Document ID
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Example Bar document:
// {
//   id: "bar456",
//   name: "The Craft Cocktail Lounge",
//   address: {
//     street: "123 Main St",
//     city: "San Francisco",
//     state: "CA",
//     zipCode: "94102",
//     country: "USA",
//     coordinates: {
//       latitude: 37.7749,
//       longitude: -122.4194
//     }
//   },
//   category: ["cocktail", "lounge"],
//   description: "A trendy cocktail bar with craft drinks",
//   rating: 4.5,
//   priceRange: 3,
//   hours: {
//     monday: { open: "17:00", close: "02:00" },
//     tuesday: { open: "17:00", close: "02:00" },
//     wednesday: { open: "17:00", close: "02:00" },
//     thursday: { open: "17:00", close: "02:00" },
//     friday: { open: "17:00", close: "02:00" },
//     saturday: { open: "17:00", close: "02:00" },
//     sunday: { open: "17:00", close: "02:00" }
//   },
//   images: ["https://example.com/bar1.jpg"],
//   phoneNumber: "+1-555-0123",
//   website: "https://craftcocktail.com",
//   createdAt: Timestamp,
//   updatedAt: Timestamp
// }

// ============================================================================
// Event Schema
// ============================================================================

export interface Event {
  id: string; // Document ID
  name: string;
  description?: string;
  createdBy: string; // User ID
  participants: string[]; // Array of User IDs
  bars: string[]; // Array of Bar IDs in order
  startDate: Date | Timestamp;
  endDate?: Date | Timestamp;
  status: "planned" | "active" | "completed" | "cancelled";
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Example Review document:
// {
//   id: "review321",
//   barId: "bar456",
//   userId: "user123",
//   rating: 5,
//   comment: "Amazing cocktails and great atmosphere!",
//   photos: ["https://example.com/review1.jpg"],
//   createdAt: Timestamp,
//   updatedAt: Timestamp
// }

// ============================================================================
// Check-in Schema
// ============================================================================

export interface CheckIn {
  id: string; // Document ID
  userId: string; // Reference to User
  barId: string; // Reference to Bar
  crawlId?: string; // Optional reference to Crawl
  timestamp: Date | Timestamp;
}

// Example CheckIn document:
// {
//   id: "checkin654",
//   userId: "user123",
//   barId: "bar456",
//   crawlId: "crawl789",
//   timestamp: Timestamp,
//   notes: "Great vibes here!"
// }

// ============================================================================
// Collection Names (for reference)
// ============================================================================

export const COLLECTIONS = {
  USERS: "users",
  BARS: "bars",
  CRAWLS: "crawls",
  REVIEWS: "reviews",
  CHECK_INS: "checkIns",
} as const;

// ============================================================================
// Helper Types
// ============================================================================

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

// Type for converting Firestore Timestamps to Date objects
export type WithDates<T> = Omit<T, "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
};

