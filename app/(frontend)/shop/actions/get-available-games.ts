"use server";

import { and, asc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { games } from "@/db/schema";
import { Response } from "@/types/response-types";
import { parsePage } from "@/utils/pagination";

export type AvailableGame = {
  id: string;
  g2bulkCode: string;
  name: string;
  imageUrl: string | null;
};

export type AvailableGames = {
  rows: AvailableGame[];
  page: number;
  hasMore: boolean;
};

export type GetAvailableGamesParams = {
  page?: string | number;
  search?: string;
};

const SHOP_PAGE_SIZE = 6;
const MAX_PAGE = 50; // bounds the query for hand-edited URLs

export default async function GetAvailableGames(
  params: GetAvailableGamesParams = {},
): Promise<Response<AvailableGames>> {
  try {
    const page = Math.min(parsePage(params.page?.toString()), MAX_PAGE);

    // Escape LIKE wildcards so user input is matched literally
    const search = params.search?.trim().replace(/[\\%_]/g, "\\$&");
    const where = and(
      eq(games.isActive, true),
      search
        ? or(
            ilike(games.name, `%${search}%`),
            ilike(games.g2bulkCode, `%${search}%`),
          )
        : undefined,
    );

    // "Load more" is URL-driven, so page N returns everything from the start
    // up to N * SHOP_PAGE_SIZE (a shared/reloaded URL shows the same list).
    // One extra row tells us if more exist, without a count query.
    const rows = await db
      .select({
        id: games.id,
        g2bulkCode: games.g2bulkCode,
        name: games.name,
        imageUrl: games.imageUrl,
      })
      .from(games)
      .where(where)
      .orderBy(asc(games.sortOrder), asc(games.id)) // stable order across pages
      .limit(page * SHOP_PAGE_SIZE + 1);

    console.log("GetAvailableGames", { page, search, rows });

    return {
      success: true,
      data: {
        rows: rows.slice(0, page * SHOP_PAGE_SIZE),
        page,
        hasMore: rows.length > page * SHOP_PAGE_SIZE,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: `${error instanceof Error ? error.message : "Failed to get games!"}`,
    };
  }
}
