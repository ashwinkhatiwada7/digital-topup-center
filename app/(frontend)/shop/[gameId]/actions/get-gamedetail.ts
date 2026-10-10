"use server";

import { and, asc, eq, isNotNull, or } from "drizzle-orm";
import { db } from "@/db";
import { games, packages } from "@/db/schema";
import { Response } from "@/types/response-types";

export type GamePackage = {
  id: string;
  catalogueName: string;
  gameCurrencyName: string | null;
  sellPriceNpr: string | null;
};

export type GameDetail = {
  id: string;
  g2bulkCode: string;
  name: string;
  imageUrl: string | null;
  requiredFields: string[] | null;
  servers: string[] | null;
  packages: GamePackage[];
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function GetGameDetail({
  gameCode,
}: {
  gameCode: string;
}): Promise<Response<GameDetail>> {
  try {
    // 1. The active game, matched by its own id (what the shop links to) or
    //    by its G2Bulk code, so both /shop/<uuid> and /shop/<code> resolve.
    //    Only compare the uuid column when the param really is a uuid,
    //    otherwise Postgres rejects it as invalid input for that type.
    const identifier = UUID_RE.test(gameCode)
      ? or(eq(games.id, gameCode), eq(games.g2bulkCode, gameCode))
      : eq(games.g2bulkCode, gameCode);

    const [game] = await db
      .select({
        id: games.id,
        g2bulkCode: games.g2bulkCode,
        name: games.name,
        imageUrl: games.imageUrl,
        requiredFields: games.requiredFields,
        servers: games.servers,
      })
      .from(games)
      .where(and(identifier, eq(games.isActive, true)))
      .limit(1);

    if (!game) {
      return { success: false, message: "Game not found" };
    }

    // 2. Its sellable packages (cost price is never sent to the browser)
    const gamePackages = await db
      .select({
        id: packages.id,
        catalogueName: packages.catalogueName,
        gameCurrencyName: packages.gameCurrencyName,
        sellPriceNpr: packages.sellPriceNpr,
      })
      .from(packages)
      .where(
        and(
          eq(packages.gameId, game.id),
          eq(packages.isActive, true),
          eq(packages.available, true),
          isNotNull(packages.sellPriceNpr),
        ),
      )
      .orderBy(asc(packages.sellPriceNpr));

    return {
      success: true,
      data: { ...game, packages: gamePackages },
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: `${error instanceof Error ? error.message : "Failed to get game detail"}`,
    };
  }
}
