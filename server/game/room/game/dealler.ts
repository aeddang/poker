import Component from '../../skeleton/component'


export default class Dealler extends Component {
  cards:Array<Card>;
  communityCards:Array<Card>;

  remove(){
    this.cards = null;
    this.communityCards= null;
    super.remove();
  }

  reset(){
    this.resetCards();
  }

  resetCards(){
    this.cards = [];
    this.createCards(Suit.Spade);
    this.createCards(Suit.Heart);
    this.createCards(Suit.Diamond);
    this.createCards(Suit.Club);
    this.shuffle();
    this.communityCards = this.getPopCards(5);
  }
  shuffle(){
    this.cards.sort(() => Math.random() - 0.5);
  }
  createCards(suit:Suit){
    for(var i=1; i<=13; ++i) this.cards.push(new Card(suit, i));
  }
  getPopCards(len:number):Array<Card> {
    let popIdx = this.cards.length - len;
    return this.cards.splice(popIdx);
  }
  getHand():Array<Card> {
    return this.getPopCards(2);
  }
  getFlop():Array<Card> {
    this.communityCards.slice(2);
  }
  getTurn():Array<Card> {
    this.communityCards.slice(0,2);
  }
}

class Card {
  suit: Suit;
  num: number;
  constructor(suit:Suit, num:number) {
    this.suit = suit;
    this.num = num;
  }
}

enum Suit{
  Spade = 1,
  Heart,
  Diamond,
  Club
}
