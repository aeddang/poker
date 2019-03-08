import Component from '../../skeleton/component'
import { nosync } from "colyseus";

export default class Dealler extends Component {

  burnCards:EntityMap<Card> = {};
  @nosync
  cards:Array<Card>;
  @nosync
  communityCards:Array<Card>;



  remove(){
    this.cards = null;
    this.communityCards= null;
    super.remove();
  }

  reset(){
    for (let id in this.burnCards) delete this.burnCards[id];
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
  openFlop() {
    this.burnCards['0'] = this.communityCards[0];
    this.burnCards['1'] = this.communityCards[1];
    this.burnCards['2'] = this.communityCards[2];
  }
  openTurn() {
    this.burnCards['3'] = this.communityCards[3];
    this.burnCards['4'] = this.communityCards[4];
  }

  showDown(){
    this.burnCards['0'] = this.communityCards[0];
    this.burnCards['1'] = this.communityCards[1];
    this.burnCards['2'] = this.communityCards[2];
    this.burnCards['3'] = this.communityCards[3];
    this.burnCards['4'] = this.communityCards[4];
  }
}

export class Card {
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
