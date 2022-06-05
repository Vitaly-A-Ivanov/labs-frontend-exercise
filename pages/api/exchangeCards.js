import { exchangeCards } from "../../src/gameStore";
import Cookies from "cookies";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
  const cookies = new Cookies(req, res);
  const playerId = cookies.get("playerId");
  const gameId = req.body.gameId;
  let discardedItems = req.body.checkBoxCard;
  if (discardedItems === undefined) discardedItems = [];

  if (!Array.isArray(discardedItems)) {
    discardedItems = Array.from(discardedItems);
  }

  await exchangeCards(gameId, playerId, discardedItems);

  return res.redirect(`/games/${gameId}`);
}