import Game from "./_components/game";

export default async function Page({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const gameId = (await params).gameId;
  console.log("hi");
  return (
    <div>
      <Game gameCode={gameId} />
    </div>
  );
}
