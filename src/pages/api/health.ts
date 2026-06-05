import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import os from "os";
import { redis } from "@/lib/redis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Hanya allow GET request
  if (req.method !== "GET") {
    return res.status(405).json({
      status: "error",
      message: "Method Not Allowed",
    });
  }

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.HEALTH_CHECK_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Cek koneksi Database via Prisma (lakukan query ringan)
    const dbStart = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = performance.now() - dbStart;

    // Cek koneksi Redis
    const redisStart = performance.now();
    let redisStatus = "error";
    try {
      await redis.ping();
      redisStatus = "connected";
    } catch (e) {
      console.error("Redis health check failed:", e);
    }
    const redisLatency = performance.now() - redisStart;

    // Info Memori Server
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(2);

    // Info Load Average
    const loadAvg = os.loadavg(); // [1 min, 5 min, 15 min]

    const response = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(), // Node.js process uptime in seconds
      environment: process.env.NODE_ENV || "development",
      services: {
        database: {
          status: "connected",
          latency_ms: Math.round(dbLatency),
        },
        redis: {
          status: redisStatus,
          latency_ms: Math.round(redisLatency),
        },
      },
      system: {
        memory: {
          total_mb: Math.round(totalMemory / 1024 / 1024),
          free_mb: Math.round(freeMemory / 1024 / 1024),
          used_mb: Math.round(usedMemory / 1024 / 1024),
          usage_percent: `${memoryUsagePercent}%`,
        },
        cpu_load: loadAvg,
        platform: os.platform(),
        arch: os.arch(),
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Health check failed:", error);

    res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      message: "Internal Server Error",
    });
  }
}
