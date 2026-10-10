import GetAvailableGames, {
  type GetAvailableGamesParams,
} from "../../shop/actions/get-available-games";
import GamesGrid from "./games-grid";

export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<GetAvailableGamesParams>;
}) {
  const { page, search } = await searchParams;
  const response = await GetAvailableGames({ page, search });

  return response.success ? (
    <GamesGrid
      games={response.data.rows}
      page={response.data.page}
      hasMore={response.data.hasMore}
    />
  ) : (
    <p className="text-destructive">{response.message}</p>
  );
}
