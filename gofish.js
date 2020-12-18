let widgetApi = null;
let userId = null;

const fishDeck = new Deck(PACK_OF_CARDS);
const myDeck = new Deck([]);

let isMyTurn = true;
let isWaiting = false;
let myScore = 0;
let opponentScore = 0;

const ACTION_GO_FISH = "go_fish";
const ACTION_REQUEST = "request";
const ACTION_REWARD = "reward";
const ACTION_PASS_TURN = "pass";
const ACTION_REVEAL = "reveal";
const ACTION_POINT = "point";

const opponentUserId = "@not-travisr:localhost";

try {
    const qs = parseFragment();
    const widgetId = assertParam(qs, 'widgetId');
    userId = assertParam(qs, 'userId');

    // Set up the widget API as soon as possible to avoid problems with the client
    widgetApi = new mxwidgets.WidgetApi(widgetId);
    widgetApi.requestCapability(mxwidgets.MatrixCapabilities.AlwaysOnScreen);

    // We want to be able to send game state
    widgetApi.requestCapabilityToSendEvent("io.t2bot.games.go_fish");
    widgetApi.requestCapabilityToSendMessage("m.text");

    // ... and receive it
    widgetApi.requestCapabilityToReceiveEvent("io.t2bot.games.go_fish");
    widgetApi.requestCapabilityToReceiveMessage("m.text");

    widgetApi.on("ready", function() {
        if (userId !== opponentUserId) {
            shuffleAndSend();
        } // else wait for receive of card state
    });

    widgetApi.on("action:send_event", ev => {
        ev.preventDefault();
        widgetApi.transport.reply(ev.detail, {}); // ack

        const mxEvent = ev.detail.data;
        if (mxEvent.type === "io.t2bot.games.go_fish") {
            if (mxEvent.content.opponentUserId === userId) {
                fishDeck.cards(cardsFromJson(mxEvent.content.fishDeck));
                myDeck.cards(cardsFromJson(mxEvent.content.opponentCards));
                isMyTurn = false;
                isWaiting = false;
                myScore = 0;
                opponentScore = 0;
                this.loadApp();
            }
        } else if (mxEvent.type === "m.room.message") {
            if (mxEvent.sender === userId) return; // echo

            const action = mxEvent.content['io.t2bot.games.go_fish.action']
            if (action === ACTION_REQUEST) {
                const ask = mxEvent.content['io.t2bot.games.go_fish.ask'];
                let cards = myDeck.drawWhere(c => c.symbol === ask, 4);
                if (cards === undefined || cards === null) {
                    widgetApi.sendRoomEvent("m.room.message", {
                        msgtype: "m.text",
                        body: "Nope, go fish!",
                        'io.t2bot.games.go_fish.action': ACTION_GO_FISH,
                        'io.t2bot.games.go_fish.ask': ask,
                    });

                    // draw the card to maintain state, but throw it away
                    fishDeck.draw();
                } else {
                    if (!Array.isArray(cards)) cards = [cards];
                    widgetApi.sendRoomEvent("m.room.message", {
                        msgtype: "m.text",
                        body: `I had ${cards.length} of those cards.`,
                        'io.t2bot.games.go_fish.action': ACTION_REWARD,
                        'io.t2bot.games.go_fish.cards': cards,
                    });
                    renderCardStates();
                }
            } else if (action === ACTION_REWARD) {
                const cards = mxEvent.content['io.t2bot.games.go_fish.cards'];
                myDeck.addToBottom(cardsFromJson(cards));
                isWaiting = false;
                checkHand();
                renderCardStates();
                renderTurn();
            } else if (action === ACTION_GO_FISH) {
                const ask = mxEvent.content['io.t2bot.games.go_fish.ask'];
                const card = fishDeck.draw();
                myDeck.addToBottom(card);
                if (card.symbol === ask) {
                    widgetApi.sendRoomEvent("m.room.message", {
                        msgtype: "m.text",
                        body: `I drew a ${card.symbol} of ${card.suit}`,
                        'io.t2bot.games.go_fish.action': ACTION_REVEAL,
                        'io.t2bot.games.go_fish.card': card,
                    });
                    isWaiting = false;
                } else {
                    widgetApi.sendRoomEvent("m.room.message", {
                        msgtype: "m.text",
                        body: "Okay, it's your turn.",
                        'io.t2bot.games.go_fish.action': ACTION_PASS_TURN,
                    });
                    isWaiting = false;
                    isMyTurn = false;
                }
                checkHand();
                renderCardStates();
                renderTurn();
            } else if (action === ACTION_PASS_TURN) {
                isWaiting = false;
                isMyTurn = true;
                renderTurn();
            } else if (action === ACTION_POINT) {
                opponentScore++;
                renderCardStates();
            }
        }
    });

    // Start the widget as soon as possible too, otherwise the client might time us out.
    widgetApi.start();
} catch (e) {
    handleError(e);
}

function allCardsOf(deck) {
    if (deck.remaining() <= 0) return [];
    let cards = deck.top(deck.remaining());
    if (!Array.isArray(cards)) cards = [cards];
    return [...cards];
}

function shuffleAndSend() {
    fishDeck.shuffle();

    // XXX: We're intentionally stacking the deck in our favour here.
    const opponentCards = [
        ...fishDeck.drawWhere(c => c.symbol === SYMBOL_ACE, 3),
        ...fishDeck.drawWhere(c => c.symbol === SYMBOL_QUEEN, 2),
    ];
    myDeck.cards([
        fishDeck.drawWhere(c => c.symbol === SYMBOL_ACE),
        ...fishDeck.draw(4),
    ]);

    // Actual code would be:
    // myDeck.cards(fishDeck.draw(5));
    // const opponentCards = fishDeck.draw(5); // we don't need to track their cards

    widgetApi.sendRoomEvent("io.t2bot.games.go_fish", {
        opponentUserId,
        fishDeck: allCardsOf(fishDeck),
        myCards: allCardsOf(myDeck),
        opponentCards,
    });

    loadApp();
}

function loadApp() {
    $("#container").html(`
        <div>
            <b>Go Fish</b><br />
            <p>Current scores: <span id="my-score">0</span> (you) vs <span id="their-score">0</span> (opponent)</p>
            <div id="my-cards">Loading...</div>
        </div>
        <div id="turn"></div>
    `);
    renderCardStates();
    renderTurn();
}

function renderCardStates() {
    $("#my-cards").html(allCardsOf(myDeck).map(c => c.html()).join(""));
    $("#my-score").text(myScore);
    $("#their-score").text(opponentScore);
}

function renderTurn() {
    if (isMyTurn) {
        $("#turn").html(`
            <p><b>It's your turn!</b></p>
            <div class="ask-row">
            <select id="ask-cards">
                ${Object.entries(SYMBOL_NAMES_PLURAL).map(([symbol, name]) => {
                    return `<option value="${symbol}">${name}</option>`;
                }).join("")}
            </select>
            <button onclick="askForCards()" ${isWaiting ? "disabled" : ""}>Ask opponent for cards</button>
            </div>
        `);
    } else {
        $("#turn").html(`
            <p><b>Waiting for opponent</b></p>
        `);
    }
}

function askForCards() {
    const askSymbol = $("#ask-cards").val();

    isWaiting = true;
    widgetApi.sendRoomEvent("m.room.message", {
        msgtype: "m.text",
        body: `Do you have any ${SYMBOL_NAMES_PLURAL[askSymbol].toLowerCase()}?`,
        'io.t2bot.games.go_fish.action': ACTION_REQUEST,
        'io.t2bot.games.go_fish.ask': askSymbol,
    });
    renderTurn();
}

function checkHand() {
    // There's probably a more efficient way to do this

    const countMap = {}; // symbol to count
    const myCards = allCardsOf(myDeck);
    for (const card of myCards) {
        if (!countMap[card.symbol]) countMap[card.symbol] = 0;
        countMap[card.symbol]++;
    }

    const fourOfKinds = Object.entries(countMap)
        .filter(([symbol, count]) => count >= 4)
        .map(([symbol, count]) => symbol);
    if (fourOfKinds.length > 0) {
        for (const symbol of fourOfKinds) {
            myDeck.drawWhere(c => c.symbol === symbol, 4);
            widgetApi.sendRoomEvent("m.room.message", {
                msgtype: "m.text",
                body: `🎉 I have four of ${SYMBOL_NAMES_PLURAL[symbol].toLowerCase()}! 1 point to me!`,
                'io.t2bot.games.go_fish.action': ACTION_POINT,
            });
            myScore++;
        }
    }
}
