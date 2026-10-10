import { Suspense } from "react";
import Shop from "../_components/shop";
import type { GetAvailableGamesParams } from "./actions/get-available-games";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<GetAvailableGamesParams>;
}) {
  return (
    // <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
    <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
      <Shop searchParams={searchParams} />
    </Suspense>
  );
}
