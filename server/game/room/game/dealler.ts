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

  findHandValue( hand:Array<Card> ):HandValue{
    let hands = this.communityCards.concat(hand);
    let compare = (a, b) => {
      if( a.num == b.num ) return a.suit > b.suit;
      return a.num > b.num
    }
    hands.sort( compare );
    let straight = [];
    let pairs = {};
    let kinds =[[], [], [], []];
    let highcards =[];
    let prevCard = null;

    let isContinue = false;
    let kindMax = 0;
    let kindIdx = -1;
    hands.forEach( c => {
      let num = c.num;
      let kind = c.suit;
      kinds[ kind ].push ( c );
      let len = kinds[ kind ].length;
      if(len > kindMax) {
        kindMax = len;
        kindIdx = kind;
      }
      if( prevCard != null) {
        if(prevCard.num == num) {
          if( pair[ num ] == undefined ) pair[ num ] = [];
          pair[ num ].push( c );
        }
        if( (prevCard.num + 1) == num ) {
          if( isContinue ) straight.push( c );
          else {
            if( straight.length < 5  ) straight = [];
            isContinue = true;
            straight = [prevCard, c];
          }
        }else{
          isContinue = false;
        }
      }
      prevCard = c;
    });

    if ( straight.length >= 5 && kindMax >= 5 ) this.findStraightFlush()
  }

  findStraightFlush( straight ):HandValue {
    let kinds = [];
    straight.forEach( c => {
      
    })

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

interface HandValue {
  highCards : Array<number>;
  value : Values;
  level : number;
}

enum Values{
  Highcard = 1,
  Pair,
  TwoPairs,
  ThreeOfAKind,
  Straight,
  FourOfAKind,
  Flush,
  FullHouse,
  StraightFlush,
  RoyalStraightFlush
}
