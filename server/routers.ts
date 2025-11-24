import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getOrCreatePlayer,
  savePlayerProgress,
  savePlayerInventory,
  loadPlayerInventory,
  savePlayerEquipment,
  loadPlayerEquipment,
  savePlayerSkills,
  loadPlayerSkills,
  getTopPlayers,
} from "./gameDb";
import type { FullGameState } from "@shared/gameTypes";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Game API
  game: router({
    // Get or create player
    getOrCreatePlayer: protectedProcedure.query(async ({ ctx }) => {
      const player = await getOrCreatePlayer(ctx.user.id);
      return player;
    }),

    // Load full game state
    load: protectedProcedure.query(async ({ ctx }) => {
      const player = await getOrCreatePlayer(ctx.user.id);
      const inventory = await loadPlayerInventory(player.id);
      const equipment = await loadPlayerEquipment(player.id);
      const skills = await loadPlayerSkills(player.id);

      const fullState: FullGameState = {
        progress: {
          level: player.level,
          experience: player.experience,
          hp: player.hp,
          maxHp: player.maxHp,
          mana: player.mana,
          maxMana: player.maxMana,
          gold: player.gold,
          positionX: player.positionX,
          positionY: player.positionY,
          skillPoints: player.skillPoints,
        },
        inventory,
        equipment,
        skills,
      };

      return fullState;
    }),

    // Save full game state
    save: protectedProcedure
      .input(
        z.object({
          progress: z.object({
            level: z.number(),
            experience: z.number(),
            hp: z.number(),
            maxHp: z.number(),
            mana: z.number(),
            maxMana: z.number(),
            gold: z.number(),
            positionX: z.number(),
            positionY: z.number(),
            skillPoints: z.number(),
          }),
          inventory: z.array(
            z.object({
              itemId: z.string(),
              quantity: z.number(),
            })
          ),
          equipment: z.object({
            helmet: z.string().nullable().optional(),
            amulet: z.string().nullable().optional(),
            backpack: z.string().nullable().optional(),
            weapon: z.string().nullable().optional(),
            armor: z.string().nullable().optional(),
            shield: z.string().nullable().optional(),
            ring: z.string().nullable().optional(),
            legs: z.string().nullable().optional(),
            arrows: z.string().nullable().optional(),
            boots: z.string().nullable().optional(),
          }),
          skills: z.array(
            z.object({
              skillId: z.string(),
              unlocked: z.boolean(),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const player = await getOrCreatePlayer(ctx.user.id);

        // Save all data
        await savePlayerProgress(player.id, input.progress);
        await savePlayerInventory(player.id, input.inventory);
        await savePlayerEquipment(player.id, input.equipment);
        await savePlayerSkills(player.id, input.skills);

        return { success: true };
      }),
  }),

  // Leaderboard API
  leaderboard: router({
    top: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(10) }).optional())
      .query(async ({ input }) => {
        const limit = input?.limit ?? 10;
        const topPlayers = await getTopPlayers(limit);
        return topPlayers;
      }),
  }),
});

export type AppRouter = typeof appRouter;
