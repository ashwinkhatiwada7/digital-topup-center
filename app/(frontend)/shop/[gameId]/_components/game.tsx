import GetGameDetail from "../actions/get-gamedetail";
import GameManagement from "./game-mangement";

export default async function Game({ gameCode }: { gameCode: string }) {
  const response = await GetGameDetail({ gameCode });

  if (!response.success) {
    return (
      <p role="alert" className="p-6 text-sm text-destructive">
        {response.message}
      </p>
    );
  }

  return <GameManagement game={response.data} />;
}
