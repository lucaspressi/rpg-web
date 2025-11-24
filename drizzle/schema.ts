import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Player game progress table
 * Stores the main game state for each player
 */
export const players = mysqlTable("players", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Character stats
  level: int("level").notNull().default(1),
  experience: int("experience").notNull().default(0),
  hp: int("hp").notNull().default(100),
  maxHp: int("maxHp").notNull().default(100),
  mana: int("mana").notNull().default(50),
  maxMana: int("maxMana").notNull().default(50),
  gold: int("gold").notNull().default(100),
  
  // Position
  positionX: int("positionX").notNull().default(10),
  positionY: int("positionY").notNull().default(10),
  
  // Skill points
  skillPoints: int("skillPoints").notNull().default(0),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSavedAt: timestamp("lastSavedAt").defaultNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

/**
 * Player inventory table
 * Stores items in the player's inventory
 */
export const inventory = mysqlTable("inventory", {
  id: int("id").autoincrement().primaryKey(),
  playerId: int("playerId").notNull().references(() => players.id, { onDelete: "cascade" }),
  
  // Item data
  itemId: varchar("itemId", { length: 64 }).notNull(),
  quantity: int("quantity").notNull().default(1),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventoryItem = typeof inventory.$inferInsert;

/**
 * Player equipment table
 * Stores currently equipped items
 */
export const equipment = mysqlTable("equipment", {
  id: int("id").autoincrement().primaryKey(),
  playerId: int("playerId").notNull().references(() => players.id, { onDelete: "cascade" }),
  
  // Equipment slots
  helmet: varchar("helmet", { length: 64 }),
  amulet: varchar("amulet", { length: 64 }),
  backpack: varchar("backpack", { length: 64 }),
  weapon: varchar("weapon", { length: 64 }),
  armor: varchar("armor", { length: 64 }),
  shield: varchar("shield", { length: 64 }),
  ring: varchar("ring", { length: 64 }),
  legs: varchar("legs", { length: 64 }),
  arrows: varchar("arrows", { length: 64 }),
  boots: varchar("boots", { length: 64 }),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = typeof equipment.$inferInsert;

/**
 * Player skills table
 * Stores unlocked skills for each player
 */
export const playerSkills = mysqlTable("playerSkills", {
  id: int("id").autoincrement().primaryKey(),
  playerId: int("playerId").notNull().references(() => players.id, { onDelete: "cascade" }),
  
  // Skill data
  skillId: varchar("skillId", { length: 64 }).notNull(),
  unlocked: int("unlocked").notNull().default(0), // Using int as boolean (0 = false, 1 = true)
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlayerSkill = typeof playerSkills.$inferSelect;
export type InsertPlayerSkill = typeof playerSkills.$inferInsert;