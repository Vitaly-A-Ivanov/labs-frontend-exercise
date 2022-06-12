import { addPlayer } from "../../src/gameStore";
import Cookies from "cookies";

export default async function handler(req, res) {
  const cookies = new Cookies(req, res);
  const playerId = cookies.get("playerId");

  if (req.body.gameId === '') {
    return res.redirect('/');
  }

  const gameId = req.body.gameId;
  await addPlayer(gameId, playerId);
  return res.redirect(`/games/${gameId}`);
}
