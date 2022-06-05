import fs from "fs";
import got from "got";
import { v4 as uuidv4 } from "uuid";

var Hand = require('pokersolver').Hand;

const chunk = (arr, len) => {
  const chunks = [];
  const n = arr.length;
  let i = 0;
  while (i < n) {
    chunks.push(arr.slice(i, (i += len)));
  }
  return chunks;
};

const readFromFile = () => {
  try {
    return JSON.parse(fs.readFileSync("game_store.json"));
  } catch (err) {
    return {};
  }
};

const writeToFile = (gameStore) =>
  fs.writeFileSync("game_store.json", JSON.stringify(gameStore));

const fetchNewDeck = async () => {
  const { deck_id } = await got(
    "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=5",
    { responseType: "json", resolveBodyOnly: true }
  );
  return deck_id;
};

const dealInitialCards = async (game) => {
  const { cards } = await got(
    `https://deckofcardsapi.com/api/deck/${game.deck}/draw/?count=${
      5 * game.numPlayers
    }`,
    { responseType: "json", resolveBodyOnly: true }
  );
  const hands = chunk(cards, 5);
  return {
    ...game,
    players: Object.keys(game.players).reduce((acc, key, index) => {
      acc[key] = { ...game.players[key], cards: hands[index] };
      return acc;
    }, {}),
  };
};

export const exchangeCards = async (gameId, playerId, discardedCardIndexes) => {
  const game = await getGame(gameId);
  const { cards: newCards } = await got(
    `https://deckofcardsapi.com/api/deck/${game.deck}/draw/?count=${discardedCardIndexes.length}`,
    { responseType: "json", resolveBodyOnly: true }
  );
  let playerHand = game.players[playerId].cards;
  discardedCardIndexes.forEach(
    (discardIndex, i) => (playerHand[discardIndex] = newCards[i])
  );
  return updateGame(gameId, {
    ...game,
    players: {
      ...game.players,
      [playerId]: { cards: playerHand, exchanged: true },
    },
  });
};

export const createNewGame = async (numPlayers, firstPlayerId) => {
  const gameId = uuidv4();
  const deck = await fetchNewDeck();
  const newGameState = {
    deck,
    numPlayers,
    players: { [firstPlayerId]: { cards: [], exchanged: false } },
  };
  updateGame(gameId, newGameState);
  return gameId;
};

export const getGame = (gameId) => {
  const games = readFromFile();
  if (!games.hasOwnProperty(gameId)) {
    throw new Error(`Could not find game with id ${gameId}`);
  }

  return games[gameId];
};

export const updateGame = (gameId, newGameState) => {
  const games = readFromFile();
  writeToFile({ ...games, [gameId]: newGameState });
  return newGameState;
};

export const allPlayersJoined = (game) =>
  Object.keys(game.players).length === game.numPlayers;

export const addPlayer = async (gameId, playerId) => {
  const game = getGame(gameId);
  if (allPlayersJoined(game)) {
    throw new Error("That game is already full");
  }
  let newGameState = {
    ...game,
    players: { ...game.players, [playerId]: { cards: [], exchanged: false } },
  };
  if (allPlayersJoined(newGameState)) {
    newGameState = await dealInitialCards(newGameState);
  }

  return updateGame(gameId, newGameState);
};

export const allPlayersExchanged = (gameId) => {
  const { players } = getGame(gameId);
  return (
    Object.keys(players).filter((pk) => players[pk].exchanged === true)
      .length === Object.keys(players).length
  );
};

export const pokerSolver = (game) => {

  let hands = {}
  let handsArray = []

  // get all cards from current game a nd solve them
  Object.entries(game).map(([key, value]) => {
    const cards = value.cards
    let hand = []
    Object.entries(cards).map(([key, value]) => {
      hand.push(value.code)
    })
    const solvedHand = Hand.solve(hand)
    hands[key] = solvedHand
    handsArray.push(solvedHand)
  })


  // determine a winner
  //TODO sometimes pokersolver library returns error 'Duplicate cards at new Hand'
  const winnerHand = Hand.winners(handsArray);

  let winner;

  winnerHand.map((winnerValue, winnerKey) => {
    Object.entries(hands).map(([key, value]) => {
      if (JSON.stringify(winnerValue) == JSON.stringify(value)) {
        winner = key
      }
    })
  })

  return winner

}
