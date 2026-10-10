"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import SearchBar from "@/components/shared/search-bar";
import type { AvailableGame } from "../../shop/actions/get-available-games";
import GameCard from "../shared/cards/game-card";
import { Shell } from "../shared";

export default function GamesGrid({
  games,
  page,
  hasMore,
}: {
  games: AvailableGame[];
  page: number;
  hasMore: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searching, setSearching] = useState(false);
  const loading = isPending || searching;

  function loadMore() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page + 1));
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <>
      <Shell>
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <h1 className="text-2xl sm:text-3xl font-semibold">Shop</h1>
            <SearchBar
              placeholder="Search games..."
              onPendingChange={setSearching}
            />
          </div>
          <div className="space-y-8">
            {games.length ? (
              <div
                className={`grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 ${loading ? "opacity-60" : ""}`}
              >
                {games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <p className="py-16 text-center text-muted-foreground">
                No games found.
              </p>
            )}

            {/* {hasMore && ( */}
            <div className="flex justify-center">
              <Button
                size="lg"
                variant="secondary"
                disabled={loading}
                onClick={loadMore}
                className="px-8"
              >
                {isPending && <Spinner />}
                Load more
              </Button>
            </div>
            {/* )} */}
          </div>
        </div>
      </Shell>
    </>
  );
}
