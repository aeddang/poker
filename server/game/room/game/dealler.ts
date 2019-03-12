import Component from '../../skeleton/component'
import { nosync } from "colyseus"


export class Card {
  suit: Suit
  num: number
  constructor(suit:Suit, num:number) {
    this.suit = suit
    this.num = num
  }
}

enum Suit{
  Spade = 0,
  Heart,
  Diamond,
  Club
}

interface HandValue {
  highCards : Array<number>
  value : Values
  level : number
  cards : Array<Card>
  id : string
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

export default class Dealler extends Component {

  burnCards:EntityMap<Card> = {}
  @nosync
  cards:Array<Card>
  @nosync
  communityCards:Array<Card>

  constructor() {
    super()
  }

  remove(){
    this.cards = null
    this.communityCards= null
    super.remove()
  }

  reset(){
    for (let id in this.burnCards) delete this.burnCards[id]
    this.resetCards()
  }

  resetCards(){
    this.cards = []
    this.createCards(Suit.Spade)
    this.createCards(Suit.Heart)
    this.createCards(Suit.Diamond)
    this.createCards(Suit.Club)
    this.shuffle()
    this.communityCards = this.getPopCards(5)
  }
  shuffle(){
    this.cards.sort(() => Math.random() - 0.5)
  }
  createCards(suit:Suit){
    for(var i=1; i<=13; ++i) this.cards.push(new Card(suit, i))
  }
  getPopCards(len:number):Array<Card> {
    let popIdx = this.cards.length - len
    return this.cards.splice(popIdx)
  }
  getHand():Array<Card> {
    return this.getPopCards(2)
  }

  test() {
    this.debuger.log( this.findHandValue( this.modifyRoyalStraightFlush() ), "RoyalStraightFlush" )
    this.debuger.log( this.findHandValue( this.modifyStraightFlush() ), "StraightFlush" )
    this.debuger.log( this.findHandValue( this.modifyFullHouse() ), "FullHouse" )
    this.debuger.log( this.findHandValue( this.modifyFlush() ), "Flush" )
    this.debuger.log( this.findHandValue( this.modifyFourOfAKind() ), "FourOfAKind" )
    this.debuger.log( this.findHandValue( this.modifyStraight() ), "Straight" )
    this.debuger.log( this.findHandValue( this.modifyThreeOfAKind() ), "ThreeOfAKind" )
    this.debuger.log( this.findHandValue( this.modifyTwoPairs() ), "TwoPairs" )
    this.debuger.log( this.findHandValue( this.modifyPair() ), "Pair" )
    this.debuger.log( this.findHandValue( this.modifyHighcard() ), "Highcard" )
  }

  modifyRoyalStraightFlush():Array<Card> {
    return [new Card(Suit.Spade, 13), new Card(Suit.Spade, 10), new Card(Suit.Spade, 12), new Card(Suit.Spade, 9), new Card(Suit.Spade, 7), new Card(Suit.Spade, 11), new Card(Suit.Spade, 6)]
  }
  modifyStraightFlush():Array<Card> {
    return [new Card(Suit.Spade, 6), new Card(Suit.Spade, 10), new Card(Suit.Spade, 12), new Card(Suit.Spade, 9), new Card(Suit.Spade, 7), new Card(Suit.Spade, 11), new Card(Suit.Spade, 8)]
  }
  modifyFullHouse():Array<Card> {
    return [new Card(Suit.Spade, 6), new Card(Suit.Heart, 6), new Card(Suit.Heart, 12), new Card(Suit.Diamond, 6), new Card(Suit.Spade, 7), new Card(Suit.Spade, 12), new Card(Suit.Spade, 8)]
  }
  modifyFlush():Array<Card> {
    return [new Card(Suit.Spade, 1), new Card(Suit.Heart, 7), new Card(Suit.Heart, 12), new Card(Suit.Spade, 6), new Card(Suit.Spade, 7), new Card(Suit.Spade, 12), new Card(Suit.Spade, 8)]
  }
  modifyFourOfAKind():Array<Card> {
    return [new Card(Suit.Spade, 1), new Card(Suit.Heart, 1), new Card(Suit.Diamond, 1), new Card(Suit.Spade, 6), new Card(Suit.Spade, 7), new Card(Suit.Club, 1), new Card(Suit.Spade, 8)]
  }
  modifyStraight():Array<Card> {
    return [new Card(Suit.Spade, 1), new Card(Suit.Heart, 2), new Card(Suit.Diamond, 3), new Card(Suit.Spade, 4), new Card(Suit.Spade, 5), new Card(Suit.Club, 1), new Card(Suit.Spade, 8)]
  }
  modifyThreeOfAKind():Array<Card> {
    return [new Card(Suit.Spade, 1), new Card(Suit.Heart, 1), new Card(Suit.Diamond, 3), new Card(Suit.Spade, 4), new Card(Suit.Spade, 5), new Card(Suit.Club, 1), new Card(Suit.Spade, 8)]
  }
  modifyTwoPairs():Array<Card> {
    return [new Card(Suit.Spade, 1), new Card(Suit.Heart, 1), new Card(Suit.Diamond, 3), new Card(Suit.Spade, 3), new Card(Suit.Spade, 5), new Card(Suit.Club, 13), new Card(Suit.Spade, 13)]
  }
  modifyPair():Array<Card> {
    return [new Card(Suit.Spade, 1), new Card(Suit.Heart, 1), new Card(Suit.Diamond, 3), new Card(Suit.Spade, 6), new Card(Suit.Spade, 5), new Card(Suit.Club, 12), new Card(Suit.Spade, 13)]
  }
  modifyHighcard():Array<Card> {
    return [new Card(Suit.Spade, 1), new Card(Suit.Heart, 9), new Card(Suit.Diamond, 3), new Card(Suit.Spade, 6), new Card(Suit.Spade, 5), new Card(Suit.Club, 12), new Card(Suit.Spade, 13)]
  }

  openFlop() {
    this.burnCards['0'] = this.communityCards[0]
    this.burnCards['1'] = this.communityCards[1]
    this.burnCards['2'] = this.communityCards[2]
  }
  openTurn() {
    this.burnCards['3'] = this.communityCards[3]
    this.burnCards['4'] = this.communityCards[4]
  }

  showDown(){
    this.burnCards['0'] = this.communityCards[0]
    this.burnCards['1'] = this.communityCards[1]
    this.burnCards['2'] = this.communityCards[2]
    this.burnCards['3'] = this.communityCards[3]
    this.burnCards['4'] = this.communityCards[4]
  }

  sortHandValues( values:Array<HandValue> ):Array< Array<HandValue> >{
    let compare = (a, b) => {
      if( a.value == b.value ) return a.level < b.level
      return a.value < b.value
    }
    values.sort( compare )
    let results = []
    let len = values.length
    var lank = [ values[ 0 ] ]
    results.push( lank )
    for(var i = 1; i < len; ++i) {
      let a =  values[ i-1 ]
      let b =  values[ i ]
      if( this.isSameHandValue( a , b ) ){
        lank.push( b )
      }else{
        lank = [ b ]
        results.push( lank )
      }
    }
    return results
  }

  isSameHandValue( valueA:HandValue, valueB:HandValue ):boolean{
    if( valueA.value != valueB.value ) return false
    if( valueA.level != valueB.level ) return false
    if( valueA.highCards == null ) return true
    let len = valueA.highCards.length
    for(var i = 0; i < len; ++i) {
      if( valueA.highCards[i] != valueB.highCards[i] ) return false
    }
    return true
  }

  getHandValue( hand:Array<Card> ):HandValue{
    return this.findHandValue( this.communityCards.concat(hand) )
  }

  findHandValue( hands:Array<Card> ):HandValue{
    //let hands = this.communityCards.concat(hand)
    let compare = (a, b) => {
      if( a.num == b.num ) return a.suit > b.suit
      return a.num < b.num
    }
    hands.sort( compare )

    let highcards =[]
    let prevCard = null

    let straight = []
    let isContinue = false

    let kinds =[[], [], [], []]
    let kindMax = 0
    let kindIdx = -1

    let pairs = {}
    let pairIds = []
    let pairMax = 0
    let pairMaxId = -1

    hands.forEach( c => {
      let num = c.num
      let kind = c.suit
      kinds[ kind ].push ( c )
      let len = kinds[ kind ].length
      if(len > kindMax) {
        kindMax = len
        kindIdx = kind
      }
      if( prevCard != null) {
        if(prevCard.num == num) {
          if( pairs[ num ] == undefined ) {
            pairs[ num ] = [ prevCard ]
            pairIds.push( num )
          }
          let pair = pairs[ num ]
          pair.push( c )
          if( pair.length > pairMax ) {
            pairMax = pair.length
            pairMaxId = num
          }
        }

        if( (prevCard.num - 1) == num ) {

          if( isContinue ) straight.push( c )
          else {
            if( straight.length < 5  ) {
              straight = []
              isContinue = true
              straight = [ prevCard, c ]
            }
          }
        }else{
          isContinue = false
        }
      }
      prevCard = c
    })
    var handValue:HandValue = null
    if ( straight.length >= 5 && kindMax >= 5 ) handValue =  this.findStraightFlush( straight )
    if ( handValue != null ) return handValue
    if ( pairIds.length >= 2 && pairMax >= 3) return this.findFullHouse( pairs, pairIds )
    if ( kindMax >= 5 ) return this.findFlush( kinds[ kindIdx ] )
    if ( pairMax == 4 ) return this.findFourOfAKind( pairs[ pairMaxId ], hands )
    if ( straight.length >= 5 ) return this.findStraight( straight )
    if ( pairMax == 3 ) return this.findThreeOfAKind( pairs[ pairMaxId ], hands )
    if ( pairIds.length > 1 ) return this.findTwoPairs( pairs, pairIds, hands )
    if ( pairIds.length == 1 ) return this.findPair( pairs[ pairIds[0] ], hands )
    return this.findHighcard( hands )
  }

  findStraightFlush( straight ):HandValue {
    let len = straight.length
    var suit = -1
    var kind = 0
    var start = -1
    var cards = null
    for(var i = 0; i < len; ++i) {
      let card = straight[ i ]
      if( suit != card.suit ) {
        kind = 0
        start = card.num
        cards = []
      }
      suit = card.suit
      kind ++
      cards.push( card )
      let able = len - i + kind
      if( able < 5 ) return null
      if(kind === 5) break
    }
    let handValue:HandValue = {
      highCards : null,
      value : (start == 13) ? Values.RoyalStraightFlush : Values.StraightFlush,
      level : start,
      cards : cards
    }
    return handValue
  }

  findFullHouse( pairs, pairIds ):HandValue {
    let len = pairIds.length
    var high = -1
    var low = -1
    for (var i = 0; i < len; ++i) {
      let id = pairIds[ i ]
      let len = pairs[id].length
      if( len >= 3 && high === -1 ) high = id
      else if( low === -1 ) low = id
      if(high != -1 && low != -1) break
    }
    return {
      highCards : [ low ],
      value : Values.FullHouse,
      level : high,
      cards : pairs[ high ].concat( pairs[ low ] )
    }
  }

  findFlush( kind ):HandValue {
    kind = kind.slice( 0, 5 )
    return {
      highCards : kind.map ( c => c.num ),
      value : Values.Flush,
      level : 1,
      cards : kind
    }
  }

  findFourOfAKind( pair , hands ):HandValue {
    let idx = Number( pair[0].num )
    let high = hands.find( c => c.num != idx  )
    return {
      highCards : [ high.num ] ,
      value : Values.FourOfAKind,
      level : idx,
      cards : pair.concat( [ high ] )
    }
  }

  findStraight( straight ):HandValue {
    let handValue:HandValue = {
      highCards : null,
      value : Values.Straight,
      level : straight[ 0 ],
      cards : straight.slice(0,5)
    }
    return handValue
  }

  findThreeOfAKind( pair , hands ):HandValue {
    let idx = Number( pair[0].num )
    let cards = []
    let highCards = []
    let len = hands.length
    for (var i = 0; i < len; ++i) {
      let card = hands[ i ]
      if( card.num != idx ) {
        cards.push( card )
        highCards.push( card.num )
      }
      if(highCards.length == 2 ) break
    }
    return {
      highCards : highCards ,
      value : Values.ThreeOfAKind,
      level : idx,
      cards : pair.concat( cards )
    }
  }

  findTwoPairs( pairs , pairIds, hands ){
    let idxHigh = pairIds[0]
    let idxLow = pairIds[1]
    let cards = pairs[ idxHigh ].concat(pairs[ idxLow ])
    let highCards = [ idxLow ]
    let len = hands.length
    for (var i = 0; i < len; ++i) {
      let card = hands[ i ]
      if( card.num != idxHigh && card.num != idxLow ) {
        cards.push( card )
        highCards.push( card.num )
        break
      }
    }
    return {
      highCards : highCards ,
      value : Values.TwoPairs,
      level : idxHigh,
      cards : cards
    }
  }

  findPair( pair , hands ):HandValue {
    let idx = Number( pair[0].num )
    let cards = []
    let highCards = []
    let len = hands.length
    for (var i = 0; i < len; ++i) {
      let card = hands[ i ]
      if( card.num != idx ) {
        cards.push( card )
        highCards.push( card.num )
      }
      if(highCards.length == 3 ) break
    }
    return {
      highCards : highCards ,
      value : Values.Pair,
      level : idx,
      cards : pair.concat( cards )
    }
  }

  findHighcard( hands ):HandValue {
    hands = hands.slice(0,5)
    return {
      highCards : hands.map( c => c.num ),
      value : Values.Highcard,
      level : hands[ 0 ].num,
      cards : hands
    }
  }



}
