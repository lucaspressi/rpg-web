import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import { players, inventory, equipment, playerSkills, users } from "../drizzle/schema";
import type { InsertPlayer, Player, InsertInventoryItem, InsertEquipment, InsertPlayerSkill } from "../drizzle/schema";

/**
 * Get or create a player for a given user
 */
export async function getOrCreatePlayer(userId: number): Promise<Player> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Try to find existing player
  const existing = await db.select().from(players).where(eq(players.userId, userId)).limit(1);
  
  if (existing.length > 0) {
    return existing[0]!;
  }

  // Create new player with default values
  const newPlayer: InsertPlayer = {
    userId,
    level: 1,
    experience: 0,
    hp: 100,
    maxHp: 100,
    mana: 50,
    maxMana: 50,
    gold: 100,
    positionX: 10,
    positionY: 10,
    skillPoints: 0,
  };

  await db.insert(players).values(newPlayer);
  
  // Fetch the newly created player
  const created = await db.select().from(players).where(eq(players.userId, userId)).limit(1);
  
  if (created.length === 0) {
    throw new Error("Failed to create player");
  }

  return created[0]!;
}

/**
 * Save player progress
 */
export async function savePlayerProgress(
  playerId: number,
  data: {
    level: number;
    experience: number;
    hp: number;
    maxHp: number;
    mana: number;
    maxMana: number;
    gold: number;
    positionX: number;
    positionY: number;
    skillPoints: number;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(players)
    .set({
      ...data,
      lastSavedAt: new Date(),
    })
    .where(eq(players.id, playerId));
}

/**
 * Save player inventory
 */
export async function savePlayerInventory(
  playerId: number,
  items: Array<{ itemId: string; quantity: number }>
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Delete existing inventory
  await db.delete(inventory).where(eq(inventory.playerId, playerId));

  // Insert new inventory
  if (items.length > 0) {
    const inventoryItems: InsertInventoryItem[] = items.map(item => ({
      playerId,
      itemId: item.itemId,
      quantity: item.quantity,
    }));

    await db.insert(inventory).values(inventoryItems);
  }
}

/**
 * Load player inventory
 */
export async function loadPlayerInventory(playerId: number): Promise<Array<{ itemId: string; quantity: number }>> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const items = await db.select().from(inventory).where(eq(inventory.playerId, playerId));
  
  return items.map(item => ({
    itemId: item.itemId,
    quantity: item.quantity,
  }));
}

/**
 * Save player equipment
 */
export async function savePlayerEquipment(
  playerId: number,
  equipmentData: {
    helmet?: string | null;
    amulet?: string | null;
    backpack?: string | null;
    weapon?: string | null;
    armor?: string | null;
    shield?: string | null;
    ring?: string | null;
    legs?: string | null;
    arrows?: string | null;
    boots?: string | null;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if equipment exists
  const existing = await db.select().from(equipment).where(eq(equipment.playerId, playerId)).limit(1);

  if (existing.length > 0) {
    // Update existing equipment
    await db.update(equipment).set(equipmentData).where(eq(equipment.playerId, playerId));
  } else {
    // Insert new equipment
    const newEquipment: InsertEquipment = {
      playerId,
      ...equipmentData,
    };
    await db.insert(equipment).values(newEquipment);
  }
}

/**
 * Load player equipment
 */
export async function loadPlayerEquipment(playerId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(equipment).where(eq(equipment.playerId, playerId)).limit(1);
  
  if (result.length === 0) {
    return {
      helmet: null,
      amulet: null,
      backpack: null,
      weapon: null,
      armor: null,
      shield: null,
      ring: null,
      legs: null,
      arrows: null,
      boots: null,
    };
  }

  return result[0]!;
}

/**
 * Save player skills
 */
export async function savePlayerSkills(
  playerId: number,
  skills: Array<{ skillId: string; unlocked: boolean }>
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Delete existing skills
  await db.delete(playerSkills).where(eq(playerSkills.playerId, playerId));

  // Insert new skills
  if (skills.length > 0) {
    const skillsData: InsertPlayerSkill[] = skills.map(skill => ({
      playerId,
      skillId: skill.skillId,
      unlocked: skill.unlocked ? 1 : 0,
    }));

    await db.insert(playerSkills).values(skillsData);
  }
}

/**
 * Load player skills
 */
export async function loadPlayerSkills(playerId: number): Promise<Array<{ skillId: string; unlocked: boolean }>> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const skills = await db.select().from(playerSkills).where(eq(playerSkills.playerId, playerId));
  
  return skills.map(skill => ({
    skillId: skill.skillId,
    unlocked: skill.unlocked === 1,
  }));
}

/**
 * Get top players for leaderboard
 */
export async function getTopPlayers(limit: number = 10) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const topPlayers = await db
    .select({
      playerName: users.name,
      level: players.level,
      experience: players.experience,
      gold: players.gold,
    })
    .from(players)
    .leftJoin(users, eq(players.userId, users.id))
    .orderBy(desc(players.level), desc(players.experience))
    .limit(limit);

  return topPlayers;
}
