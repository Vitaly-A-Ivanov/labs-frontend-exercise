export default function Card({ cardImage, cardValue, cardSuit, cardIndex, showCheckBox }) {

  return (
    <div key={cardIndex} className="col-5 col-md-2 myCard">
      <img src={cardImage} alt={cardValue + " " + cardSuit} className="img-fluid" />
      <div className={showCheckBox === 'true'? 'd-flex align-items-center justify-content-center pt-1': 'd-none'}>
        <input type="checkbox" id={`checkbox-${cardIndex}`} name="checkBoxCard" value="1" className="me-2" />
        <label htmlFor={`checkbox-${cardIndex}`} className="myCheckbox__text">Discard</label>
      </div>
    </div>
  );
}