import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { sdk } from "./_core/sdk";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export interface PlayerPosition {
  x: number;
  y: number;
}

export interface OnlinePlayer {
  userId: number;
  playerId: number;
  name: string;
  level: number;
  position: PlayerPosition;
  hp: number;
  maxHp: number;
  socketId: string;
}

export interface MultiplayerEvents {
  // Client -> Server
  "player:join": (data: { position: PlayerPosition; level: number; hp: number; maxHp: number }) => void;
  "player:move": (position: PlayerPosition) => void;
  "player:attack": (data: { targetId: string; damage: number }) => void;
  "player:update": (data: { hp: number; maxHp: number; level: number }) => void;
  "pvp:attack": (data: { targetPlayerId: number; damage: number }) => void;

  // Server -> Client
  "players:list": (players: OnlinePlayer[]) => void;
  "player:joined": (player: OnlinePlayer) => void;
  "player:moved": (data: { playerId: number; position: PlayerPosition }) => void;
  "player:attacked": (data: { attackerId: number; targetId: string; damage: number }) => void;
  "player:updated": (data: { playerId: number; hp: number; maxHp: number; level: number }) => void;
  "player:left": (playerId: number) => void;
  "pvp:damage": (data: { attackerId: number; attackerName: string; targetPlayerId: number; damage: number }) => void;
  "pvp:death": (data: { victimId: number; victimName: string; killerId: number; killerName: string }) => void;
}

// Store online players in memory
const onlinePlayers = new Map<string, OnlinePlayer>();

export function setupMultiplayer(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/api/socket.io",
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication token required"));
      }

      // Verify JWT token
      const payload = await sdk.verifySession(token);
      if (!payload || !payload.openId) {
        return next(new Error("Invalid token"));
      }

      // Get user from database
      const db = await getDb();
      if (!db) {
        return next(new Error("Database not available"));
      }

      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.openId, payload.openId))
        .limit(1);

      if (userResult.length === 0) {
        return next(new Error("User not found"));
      }

      // Attach user to socket
      (socket as any).user = userResult[0];
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user;
    console.log(`Player connected: ${user.name} (ID: ${user.id})`);

    let currentPlayer: OnlinePlayer | null = null;

    // Player joins the game
    socket.on("player:join", (data: { position: PlayerPosition; level: number; hp: number; maxHp: number }) => {
      currentPlayer = {
        userId: user.id,
        playerId: user.id, // Using userId as playerId for simplicity
        name: user.name || "Anonymous",
        level: data.level,
        position: data.position,
        hp: data.hp,
        maxHp: data.maxHp,
        socketId: socket.id,
      };

      onlinePlayers.set(socket.id, currentPlayer);

      // Send list of all online players to the new player
      const playersList = Array.from(onlinePlayers.values()).filter(p => p.socketId !== socket.id);
      socket.emit("players:list", playersList);

      // Broadcast new player to all other players
      socket.broadcast.emit("player:joined", currentPlayer);

      console.log(`Player joined: ${currentPlayer.name} at (${data.position.x}, ${data.position.y})`);
    });

    // Player moves
    socket.on("player:move", (position: PlayerPosition) => {
      if (currentPlayer) {
        currentPlayer.position = position;
        onlinePlayers.set(socket.id, currentPlayer);

        // Broadcast movement to all other players
        socket.broadcast.emit("player:moved", {
          playerId: currentPlayer.playerId,
          position,
        });
      }
    });

    // Player attacks
    socket.on("player:attack", (data: { targetId: string; damage: number }) => {
      if (currentPlayer) {
        // Broadcast attack to all players
        io.emit("player:attacked", {
          attackerId: currentPlayer.playerId,
          targetId: data.targetId,
          damage: data.damage,
        });
      }
    });

    // PvP attack
    socket.on("pvp:attack", (data: { targetPlayerId: number; damage: number }) => {
      if (!currentPlayer) return;

      // Find target player
      const targetSocket = Array.from(onlinePlayers.entries()).find(
        ([, player]) => player.playerId === data.targetPlayerId
      );

      if (!targetSocket) {
        console.log(`PvP attack failed: target player ${data.targetPlayerId} not found`);
        return;
      }

      const [targetSocketId, targetPlayer] = targetSocket;

      // Update target HP
      const newHp = Math.max(0, targetPlayer.hp - data.damage);
      targetPlayer.hp = newHp;
      onlinePlayers.set(targetSocketId, targetPlayer);

      console.log(
        `PvP: ${currentPlayer.name} attacked ${targetPlayer.name} for ${data.damage} damage (HP: ${newHp}/${targetPlayer.maxHp})`
      );

      // Notify target player
      io.to(targetSocketId).emit("pvp:damage", {
        attackerId: currentPlayer.playerId,
        attackerName: currentPlayer.name,
        targetPlayerId: targetPlayer.playerId,
        damage: data.damage,
      });

      // Broadcast to all players (for visual effects)
      io.emit("pvp:damage", {
        attackerId: currentPlayer.playerId,
        attackerName: currentPlayer.name,
        targetPlayerId: targetPlayer.playerId,
        damage: data.damage,
      });

      // Check if target died
      if (newHp <= 0) {
        console.log(`PvP Death: ${targetPlayer.name} was killed by ${currentPlayer.name}`);
        
        // Notify all players about the death
        io.emit("pvp:death", {
          victimId: targetPlayer.playerId,
          victimName: targetPlayer.name,
          killerId: currentPlayer.playerId,
          killerName: currentPlayer.name,
        });

        // Reset target player HP (respawn)
        targetPlayer.hp = targetPlayer.maxHp;
        onlinePlayers.set(targetSocketId, targetPlayer);
      }
    });

    // Player stats update (HP, level, etc.)
    socket.on("player:update", (data: { hp: number; maxHp: number; level: number }) => {
      if (currentPlayer) {
        currentPlayer.hp = data.hp;
        currentPlayer.maxHp = data.maxHp;
        currentPlayer.level = data.level;
        onlinePlayers.set(socket.id, currentPlayer);

        // Broadcast update to all other players
        socket.broadcast.emit("player:updated", {
          playerId: currentPlayer.playerId,
          hp: data.hp,
          maxHp: data.maxHp,
          level: data.level,
        });
      }
    });

    // Player disconnects
    socket.on("disconnect", () => {
      if (currentPlayer) {
        console.log(`Player disconnected: ${currentPlayer.name}`);
        onlinePlayers.delete(socket.id);

        // Broadcast player left to all other players
        socket.broadcast.emit("player:left", currentPlayer.playerId);
      }
    });
  });

  return io;
}

// Helper to get online players count
export function getOnlinePlayersCount(): number {
  return onlinePlayers.size;
}
