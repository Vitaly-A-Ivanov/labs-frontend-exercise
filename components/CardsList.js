import Card from "./Card";

export default function CardsList({ userCards, showCheckbox }) {

  return (
    <div className=" order-2 order-md-1 row col-md-10 justify-content-evenly cardsList">
      {userCards.map((card, index) =>
        <Card key={index} cardImage={card.image} cardValue={card.value} cardSuit={card.suit} cardIndex={index}
              showCheckBox={showCheckbox} />
      )
      }
    </div>
  );
};

