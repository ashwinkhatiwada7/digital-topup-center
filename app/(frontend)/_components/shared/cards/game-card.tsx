import Link from "next/link";
import { Gamepad2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AvailableGame } from "../../../shop/actions/get-available-games";

const SHINE =
  "linear-gradient(115deg, transparent 0 20%, rgba(255,255,255,.14) 46% 60%, transparent 60% 70%, rgba(255,255,255,.1) 70% 80%, transparent 80%)";

export default function GameCard({ game }: { game: AvailableGame }) {
  return (
    <div className="relative group flex flex-col overflow-hidden rounded-xl bg-card smooth hover:-translate-y-1 hover:shadow-lg">
      <div className="relative overflow-hidden bg-muted">
        {game.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.imageUrl}
            alt={game.name}
            loading="lazy"
            className="size-full object-cover smooth group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Gamepad2 className="size-10" />
          </div>
        )}
      </div>
      <div className="relative p-3 pb-1.5">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5">
          {game.name}
        </h3>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-1"
          style={{ backgroundImage: SHINE }}
        />
      </div>
      <Button asChild className="py-4.5 w-full rounded-t-none! smooth">
        <Link href={`/shop/${game.id}`}>
          <ShoppingCart />
          Buy now
        </Link>
      </Button>
    </div>
  );
}
