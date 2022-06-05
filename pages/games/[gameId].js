import Cookies from "cookies";
import { useRouter } from "next/router";
import { allPlayersJoined, getGame, allPlayersExchanged } from "../../src/gameStore";
import CardsList from "../../components/CardsList";
import { useEffect } from "react";

export async function getServerSideProps(context) {
  const gameId = context.params.gameId;
  const cookies = new Cookies(context.req, context.res);
  const playerId = cookies.get("playerId");

  let gameState;
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

  if (!allPlayersJoined(gameState)) {
    return {
      redirect: {
        destination: `/games/${gameId}/pending`,
        permanent: false
      }
    };
  }

  if (allPlayersExchanged(gameId)) {
    return {
      props: {
        currentPlayer: gameState.players[playerId]
      },
      redirect: {
        destination: `/games/${gameId}/gameComplete`,
        permanent: true
      }
    };
  }


  return {
    props: {
      currentPlayer: gameState.players[playerId]
    }
  };
}

const Game = ({ currentPlayer: { cards, exchanged } }) => {
  const router = useRouter();
  const { gameId } = router.query;

  if (exchanged) {
    useEffect(() => {
      setTimeout(() => (document.location = `/games/${gameId}`), 5000);
    }, []);

    return (
      <div>
        <p className="myTitle mb-5">Your Hand:</p>
        <div className="d-flex justify-content-center">
          <CardsList userCards={cards} showCheckbox="false" />
        </div>
        <div className="text-center mt-md-5 mb-3"><strong>Waiting for other players to exchange their cards....</strong></div>
      </div>
    );
  }

  return (
    <form action="/api/exchangeCards" method="POST" className="d-md-inline-flex row gx-0">
      <CardsList userCards={cards} showCheckbox="true" />
      <input name="gameId" value={gameId} type="hidden" />
      <div className="order-1 order-md-2 col-md-2 d-flex flex-column align-items-center justify-content-around">
        <div className="">
          <p className="h3 text-center myHeading"> 5 Card Draw</p>
          <p className="text-center myText">It's like poker but easy</p>
        </div>
        <div className="order-3 myButton">
          <button className="w-100 pt-4 pb-4 pt-md-1 pb-md-1 myButton__text">Burn selected cards</button>
        </div>
      </div>
    </form>
  );
};

export default Game;
