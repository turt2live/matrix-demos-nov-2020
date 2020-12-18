class Card {
    constructor(suit, symbol) {
        this.suit = suit;
        this.symbol = symbol;
    }

    html() {
        return `
            <img src="cards/${this.symbol}_of_${this.suit}.png" class="card" />
        `;
    }
}

function cardsFromJson(jsonArray) {
    return jsonArray.map(c => new Card(c.suit, c.symbol));
}

const SUIT_HEARTS = "hearts";
const SUIT_DIAMONDS = "diamonds";
const SUIT_SPADES = "spades";
const SUIT_CLUBS = "clubs";

const ALL_SUITS = [SUIT_HEARTS, SUIT_DIAMONDS, SUIT_SPADES, SUIT_CLUBS];

const SYMBOL_ACE = "ace";
const SYMBOL_KING = "king";
const SYMBOL_QUEEN = "queen";
const SYMBOL_JACK = "jack";

function symbolForNumber(n) {
    return n.toString();
}

const SYMBOL_NAMES_PLURAL = {
    [symbolForNumber(2)]: 'Twos',
    [symbolForNumber(3)]: 'Threes',
    [symbolForNumber(4)]: 'Fours',
    [symbolForNumber(5)]: 'Fives',
    [symbolForNumber(6)]: 'Sixes',
    [symbolForNumber(7)]: 'Sevens',
    [symbolForNumber(8)]: 'Eights',
    [symbolForNumber(9)]: 'Nines',
    [symbolForNumber(10)]: 'Tens',
    [SYMBOL_ACE]: 'Aces',
    [SYMBOL_JACK]: 'Jacks',
    [SYMBOL_QUEEN]: 'Queens',
    [SYMBOL_KING]: 'Kings',
};

const ALL_SYMBOLS = [SYMBOL_ACE, SYMBOL_KING, SYMBOL_QUEEN, SYMBOL_JACK];
for (let i = 2; i <= 10; i++) {
    ALL_SYMBOLS.push(symbolForNumber(i));
}

const BY_SYMBOL = {};
for (const symbol of ALL_SYMBOLS) {
    BY_SYMBOL[symbol] = [...ALL_SUITS];
}

const PACK_OF_CARDS = [];
for (const symbol of ALL_SYMBOLS) {
    for (const suit of ALL_SUITS) {
        PACK_OF_CARDS.push(new Card(suit, symbol));
    }
}
