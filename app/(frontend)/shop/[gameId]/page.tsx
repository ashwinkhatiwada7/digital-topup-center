import Game from "./_components/game";

export default async function Page({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const gameId = (await params).gameId;
  return (
    <>
      <Game gameCode={gameId} />
    </>
  );
}
