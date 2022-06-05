import CardsList from "../../../components/CardsList";
import { getGame, pokerSolver } from "../../../src/gameStore";
import Cookies from "cookies";

export async function getServerSideProps(context) {
  const gameId = context.params.gameId;
  let gameState;
  const cookies = new Cookies(context.req, context.res);
  const playerId = cookies.get("playerId");


  try {
    gameState = getGame(gameId);
  } catch (err) {
    // game not found
    return {
      redirect: {
        destination: `/`,
        permanent: false
      }
    };
  }

  const winner = pokerSolver(gameState.players);

  let isWinner = false;
  if (winner === playerId) isWinner = true;


  return {
    props: {
      currentPlayer: gameState.players[playerId],
      winnerPlayer: gameState.players[winner],
      winner: isWinner
    }
  };
}

const gameComplete = ({ winner, currentPlayer, winnerPlayer }) => {

  return (
    <div className="">
      <p className="myTitle mb-3 mb-md-5 ">
        <strong>
          {winner === true ? "You win!" : "You Lost!"}
        </strong>
      </p>
      <CardsList userCards={currentPlayer.cards} showCheckbox="false" />
      <p className="myTitle mb-3 mb-md-5 mt-md-5">
        <strong>
          The winning hand:
        </strong></p>
      <CardsList userCards={winnerPlayer.cards} showCheckbox="false" />
    </div>

  );
};

export default gameComplete;
