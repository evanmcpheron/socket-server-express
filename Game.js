class Game {
  constructor() {
    this.deck = [];
    this.dealer = null;
    this.player = null;
    this.wallet = 0;
    this.bet = 0;
    this.gameOver = false;
    this.message = null;
  }

  startNewGame(type) {
    if (type === "continue") {
      if (this.wallet > 0) {
        const deck = this.deck.length < 10 ? this.generateDeck() : this.deck;
        const { updatedDeck, player, dealer } = this.dealCards(deck);
        this.bet = 0;
        this.deck = updatedDeck;
        this.player = player;
        this.dealer = dealer;
        this.gameOver = false;
        this.message = null;
      } else {
        this.message = "Game over! You are broke! Please start a new game.";
      }
    } else {
      const deck = this.generateDeck();
      const { updatedDeck, player, dealer } = this.dealCards(deck);

      this.deck = updatedDeck;
      this.player = player;
      this.dealer = dealer;
      this.wallet = 100;
      this.bet = 0;
      this.gameOver = false;
      this.message = null;
    }
  }

  generateDeck() {
    const cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];
    const suits = ["D", "C", "H", "S"];
    const deck = [];
    for (const card of cards) {
      for (const suit of suits) {
        deck.push({ number: card, suit });
      }
    }
    return deck;
  }

  getRandomCard(deck) {
    const updatedDeck = deck;
    const randomIndex = Math.floor(Math.random() * updatedDeck.length);
    const randomCard = updatedDeck[randomIndex];
    updatedDeck.splice(randomIndex, 1);
    return { randomCard, updatedDeck };
  }

  dealCards(deck) {
    const playerCard1 = this.getRandomCard(deck);
    const dealerCard1 = this.getRandomCard(playerCard1.updatedDeck);
    const playerCard2 = this.getRandomCard(dealerCard1.updatedDeck);
    const playerStartingHand = [playerCard1.randomCard, playerCard2.randomCard];
    const dealerStartingHand = [dealerCard1.randomCard, {}];
    const player = {
      cards: playerStartingHand,
      count: this.getCount(playerStartingHand),
    };
    const dealer = {
      cards: dealerStartingHand,
      count: this.getCount(dealerStartingHand),
    };

    return { updatedDeck: playerCard2.updatedDeck, player, dealer };
  }

  hit(betAmount) {
    if (!this.gameOver) {
      if (betAmount > this.wallet) {
        this.message = "You can't bet more than you have.";
      } else {
        if (betAmount) {
          this.bet += betAmount;
          this.wallet -= betAmount;
          const { randomCard, updatedDeck } = this.getRandomCard(this.deck);
          const player = this.player;
          player.cards.push(randomCard);
          player.count = this.getCount(player.cards);

          if (player.count > 21) {
            this.player = player;
            this.gameOver = true;
            this.message = "BUST!";
          } else {
            this.deck = updatedDeck;
            this.player = player;
          }
        } else {
          this.message = "Please place bet.";
        }
      }
    } else {
      this.message = "Game over! Please start a new game.";
    }
  }

  dealerDraw(dealer, deck) {
    const { randomCard, updatedDeck } = this.getRandomCard(deck);
    dealer.cards.push(randomCard);
    dealer.count = this.getCount(dealer.cards);
    return { dealer, updatedDeck };
  }

  getCount(cards) {
    const rearranged = [];
    cards.forEach((card) => {
      if (card.number === "A") {
        rearranged.push(card);
      } else if (card.number) {
        rearranged.unshift(card);
      }
    });

    return rearranged.reduce((total, card) => {
      if (card.number === "J" || card.number === "Q" || card.number === "K") {
        return total + 10;
      } else if (card.number === "A") {
        return total + 11 <= 21 ? total + 11 : total + 1;
      } else {
        return total + card.number;
      }
    }, 0);
  }

  stay(betAmount) {
    if (betAmount > this.wallet) {
      this.message = "You can't bet more than you have.";
    } else {
      if (betAmount) {
        this.bet += betAmount;
        this.wallet -= betAmount;
        if (!this.gameOver) {
          // Show dealer's 2nd card
          const randomCard = this.getRandomCard(this.deck);
          let deck = randomCard.updatedDeck;
          let dealer = this.dealer;
          dealer.cards.pop();
          dealer.cards.push(randomCard.randomCard);
          dealer.count = this.getCount(dealer.cards);

          // Keep drawing cards until count is 17 or more
          while (dealer.count < 17) {
            const draw = this.dealerDraw(dealer, deck);
            dealer = draw.dealer;
            deck = draw.updatedDeck;
          }

          if (dealer.count > 21) {
            this.deck = deck;
            this.dealer = dealer;
            this.wallet = this.wallet + this.bet * 2;
            this.gameOver = true;
            this.message = "Dealer bust! You win!";
          } else {
            const winner = this.getWinner(dealer, this.player);
            let wallet = this.wallet;
            let message;

            if (winner === "dealer") {
              message = "Dealer wins...";
              this.wallet -= this.bet;
            } else if (winner === "player") {
              wallet += this.bet * 2;
              message = "You win!";
            } else {
              wallet += betAmount;
              message = "Push.";
            }

            this.deck = deck;
            this.dealer = dealer;
            this.wallet = wallet;
            this.gameOver = true;
            this.message = message;
          }
        } else {
          this.message = "Game over! Please start a new game.";
        }
      } else {
        this.message = "Please place bet.";
      }
    }
  }

  getWinner(dealer, player) {
    if (dealer.count > player.count) {
      return "dealer";
    } else if (dealer.count < player.count) {
      return "player";
    } else {
      return "push";
    }
  }
}

module.exports = { Game };
