import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const zoneTypeEnum = pgEnum("zone_type", [
  "ps1", "ps2", "ps3",
  "arena", "vip"
]);

export const sessionStatusEnum = pgEnum("session_status", [
  "active", "completed"
]);

export const paymentTypeEnum = pgEnum("payment_type", [
  "prepaid", "postpaid"
]);

// Operator (admin)
export const operators = pgTable("operators", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Kompyuter/o'rindiqlar
export const stations = pgTable("stations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),        // "Arena-1", "VIP-1-1", "PS1"
  zoneType: zoneTypeEnum("zone_type").notNull(),
  roomNumber: integer("room_number"),   // VIP uchun xona raqami (1,2,3,4)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sessionlar
export const sessions = pgTable("sessions_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  stationId: uuid("station_id").references(() => stations.id).notNull(),
  operatorId: uuid("operator_id").references(() => operators.id),
  customerName: text("customer_name"),
  paymentType: paymentTypeEnum("payment_type").notNull(),
  prepaidAmount: integer("prepaid_amount"),   // Prepaid uchun to'langan summa
  prepaidMinutes: integer("prepaid_minutes"), // Shuncha daqiqa berilgan
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  totalMinutes: integer("total_minutes"),
  totalAmount: integer("total_amount"),
  status: sessionStatusEnum("status").default("active"),
});

// Types
export type Operator = typeof operators.$inferSelect;
export type Station = typeof stations.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;