import { integer, pgTable, varchar, date,  } from "drizzle-orm/pg-core";
import type{ CampaignStatus } from "../types/campaign";

export const campaignTable = pgTable("campaigns", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default('draft' as CampaignStatus),
  subject: varchar("subject", { length: 255 }).notNull(),
  emailContent: varchar("email_content", { length: 5000 }).notNull(),
  fromName: varchar("from_name", { length: 100 }).notNull(),
  fromEmail: varchar("from_email", { length: 100 }).notNull(),
  recieptCount: integer("reciept_count").notNull().default(0),
  createdAt: date("created_at").notNull().defaultNow(),
  scheduledAt: date("scheduled_at"),
});

export const statsTable = pgTable("campaign_stats", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  campaignId: integer("campaign_id").references(() => campaignTable.id).notNull(),
    sentCount: integer("sent_count").notNull().default(0),
    delieveredCount: integer("delivered_count").notNull().default(0),
    bouncedCount: integer("bounced_count").notNull().default(0),
    failedCount: integer("failed_count").notNull().default(0),
    complainedCount: integer("complained_count").notNull().default(0),
});

export const recipientTable = pgTable("recipients", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  campaignId: integer("campaign_id").references(() => campaignTable.id).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  name: varchar("name", { length: 100 }),
  messageId: varchar("message_id", { length: 255 }),    
  sentAt: date("sent_at"),
  delieveredAt: date("delivered_at"),
});


export const suppressionListTable = pgTable("suppression_list", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  reason: varchar("reason", { length: 500 }).notNull(),
  addedAt: date("added_at").notNull().defaultNow(),
});


