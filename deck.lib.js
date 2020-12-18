(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Deck = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
  /**
   * @module deck
   */
  'use strict';

  var isArray = require( './lib/is-array' );

  // Get a random integer index within the provided array
  function randomIndex( arr ) {
    return Math.floor( Math.random() * arr.length );
  }

  // Predicate function to filter out undefined values
  function isNotUndefined( val ) {
    return typeof val !== 'undefined';
  }

  // Shuffle an array in place, returning that array
  function shuffle( arr ) {
    // Fisher–Yates implementation adapted from http://bost.ocks.org/mike/shuffle/
    var remaining = arr.length;
    var tmp;
    var idx;

    // While there remain elements to shuffle…
    while ( remaining ) {
      // Pick a remaining element...
      idx = Math.floor( Math.random() * remaining-- );

      // And swap it with the current element.
      tmp = arr[ remaining ];
      arr[ remaining ] = arr[ idx ];
      arr[ idx ] = tmp;
    }
  }

  /**
   * @class Deck
   */
  function Deck( arr ) {
    if ( isArray( arr ) ) {
      this.cards( arr );
    }
  }

  /**
   * Populate the deck with an array of cards, wiping out any cards that had
   * previously been added to the deck
   *
   * @chainable
   * @param  {Array} cardArray An array of cards to use for the deck
   * @return {Deck} The deck instance (for chaining)
   */
  Deck.prototype.cards = function( cardArray ) {
    if ( ! isArray( cardArray ) ) { return this; }
    // Replace the deck with the new cards
    this._stack = cardArray;
    return this;
  };

  /**
   * Randomize the order of cards within the deck
   *
   * @chainable
   * @return {Deck} The deck instance (for chaining)
   */
  Deck.prototype.shuffle = function() {
    shuffle( this._stack );
    return this;
  };

  /**
   * Get the number of cards currently contained within the deck
   *
   * @return {Number} The number of cards left in the deck
   */
  Deck.prototype.remaining = function() {
    return this._stack.length;
  };

  /**
   * Draw a card or cards, removing the drawn cards from the deck
   *
   * @param {Number} [count] The number of cards to draw
   * @return {Object|Array} A single card or an array of cards
   */
  Deck.prototype.draw = function( count ) {
    count || ( count = 1 );
    var drawnCards = this._stack.splice( 0, count );
    if ( ! drawnCards.length ) { return; }
    return count === 1 ? drawnCards[ 0 ] : drawnCards;
  };

  /**
   * Draw a card or cards from the bottom of the deck, removing the drawn cards
   * from the deck
   *
   * @param  {Number} [count] The number of cards to draw
   * @return {Object|Array} A single card or an array of cards
   */
  Deck.prototype.drawFromBottom = function( count ) {
    count || ( count = 1 );
    var drawnCards = this._stack.splice( -count, count ).reverse();
    if ( ! drawnCards.length ) { return; }
    return count === 1 ? drawnCards[ 0 ] : drawnCards;
  };

  /**
   * Draw a card or cards matching a condition defined in a provided predicate
   * function, removing the drawn cards from the deck
   *
   * @param {Function} predicate A function to use to evaluate whether a given
   *                             card in the deck should be drawn
   * @param {Number} [count] The number of cards to draw
   * @return {Object|Array} A single card or an array of cards
   */
  Deck.prototype.drawWhere = function( predicate, count ) {
    if ( typeof predicate !== 'function' ) {
      return;
    }
    count || ( count = 1 );
    var drawnCards = this._stack.filter( predicate ).slice( 0, count );
    for ( var i = 0; i < drawnCards.length; i++ ) {
      // Remove from the stack
      this._stack.splice( this._stack.indexOf( drawnCards[ i ] ), 1 );
    }
    if ( ! drawnCards.length ) { return; }
    return count === 1 ? drawnCards[ 0 ] : drawnCards;
  };

  /**
   * Draw a card or cards from random positions in the deck, removing the drawn
   * cards from the deck
   *
   * @param {Number} [count] The number of cards to draw
   * @return {Object|Array} A single card or an array of cards
   */
  Deck.prototype.drawRandom = function( count ) {
    if ( ! this._stack.length ) { return; }
    count || ( count = 1 );
    if ( count === 1 ) {
      return this._stack.splice( randomIndex( this._stack ), 1 )[ 0 ];
    }
    var drawnCards = [];
    for ( var i = 0; i < count; i++ ) {
      drawnCards.push( this._stack.splice( randomIndex( this._stack ), 1 )[ 0 ] );
    }
    drawnCards = drawnCards.filter( isNotUndefined );
    return drawnCards;
  };

  /**
   * Insert a card or cards at the bottom of the deck in order
   *
   * @chainable
   * @param {Object|Array} cards The card object or array of card objects to insert
   * @return {Deck} The deck instance (for chaining)
   */
  Deck.prototype.addToBottom = function( cards ) {
    if ( ! isArray( cards ) ) {
      // Handle individual card objects
      return this.addToBottom( [ cards ] );
    }
    this._stack.push.apply( this._stack, cards );
    return this;
  };

  /**
   * Insert a card or cards at the bottom of the deck in random order
   *
   * @chainable
   * @param {Object|Array} cards The card object or array of card objects to insert
   * @return {Deck} The deck instance (for chaining)
   */
  Deck.prototype.shuffleToBottom = function( cards ) {
    if ( ! isArray( cards ) ) {
      // Handle individual card objects
      return this.shuffleToBottom( [ cards ] );
    }
    shuffle( cards );
    return this.addToBottom( cards );
  };

  /**
   * Insert a card or cards at the top of the deck in order
   *
   * @chainable
   * @param {Object|Array} cards The card object or array of card objects to insert
   * @return {Deck} The deck instance (for chaining)
   */
  Deck.prototype.addToTop = function( cards ) {
    if ( ! isArray( cards ) ) {
      // Handle individual card objects
      return this.addToTop( [ cards ] );
    }
    this._stack.unshift.apply( this._stack, cards );
    return this;
  };

  /**
   * Insert a card or cards at the top of the deck in random order
   *
   * @chainable
   * @param {Object|Array} cards The card object or array of card objects to insert
   * @return {Deck} The deck instance (for chaining)
   */
  Deck.prototype.shuffleToTop = function( cards ) {
    if ( ! isArray( cards ) ) {
      // Handle individual card objects
      return this.shuffleToTop( [ cards ] );
    }
    shuffle( cards );
    return this.addToTop( cards );
  };

  /**
   * Insert a card or cards into the deck at random positions
   *
   * @chainable
   * @param {Object|Array} cards The card object or array of card objects to insert
   * @return {Deck} The deck instance (for chaining)
   */
  Deck.prototype.addRandom = function( cards ) {
    if ( ! isArray( cards ) ) {
      // Handle individual card objects
      return this.addRandom( [ cards ] );
    }
    var stack = this._stack;
    cards.forEach( function( card ) {
      stack.splice( randomIndex( stack ), 0, card );
    } );
    return this;
  };

  /**
   * Look at a card or cards on the bottom of the deck, without removing them
   * from the deck
   *
   * @param {Number} count The number of cards to retrieve
   * @return {Object|Array} A single card or an array of cards
   */
  Deck.prototype.top = function( count ) {
    if ( ! this._stack.length ) { return; }
    count || ( count = 1 );
    var returnedCards = this._stack.slice( 0, count );
    return count === 1 ? returnedCards[ 0 ] : returnedCards;
  };

  /**
   * Look at a card or cards on the top of the deck, without removing them from
   * the deck
   *
   * @param {Number} count The number of cards to retrieve
   * @return {Object|Array} A single card or an array of cards
   */
  Deck.prototype.bottom = function( count ) {
    if ( ! this._stack.length ) { return; }
    count || ( count = 1 );
    var returnedCards =  this._stack.slice( -count ).reverse();
    return count === 1 ? returnedCards[ 0 ] : returnedCards;
  };

  /**
   * Look at a random card or cards, without removing them from the deck
   *
   * @param {Number} count The number of cards to retrieve
   * @return {Object|Array} A single card or an array of cards
   */
  Deck.prototype.random = function( count ) {
    if ( ! this._stack.length ) { return; }
    count || ( count = 1 );
    var idx;
    if ( count === 1 ) {
      idx = randomIndex( this._stack );
      return this._stack.slice( idx, idx + 1 )[ 0 ];
    }
    var cards = [].concat( this._stack );
    shuffle( cards );
    cards.length = count;
    return cards.filter( isNotUndefined );
  };

  module.exports = Deck;

  },{"./lib/is-array":2}],2:[function(require,module,exports){
  'use strict';
  // Logic adapted from https://github.com/lodash/lodash-compat/blob/master/lodash.js
  // As most of this is back-compatibility for older browsers, omit these
  // impossible-to-test-in-modern-node paths from coverage reporting

  var arrayTag = '[object Array]';

  /* istanbul ignore next */
  function isValidLength( val ) {
    // Ignoring the max-safe-integer rule because that's too many cards for any deck
    return typeof val === 'number' && val > -1 && val % 1 === 0;
  }

  /* istanbul ignore next */
  function isObjecty( val ) {
    return ! ! val && typeof val === 'object';
  }

  /* istanbul ignore next */
  function isArray( arr ) {
    var isObject =  isObjecty( arr );
    var hasLengthProperty = isValidLength( arr.length );
    return isObject && hasLengthProperty && Object.toString.call( arr ) === arrayTag;
  }

  /* istanbul ignore next */
  // Try the native method first, then fall back to our back-compatibility method
  module.exports = Array.isArray || isArray;

  },{}]},{},[1])(1)
  });

  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZWNrLmpzIiwibGliL2lzLWFycmF5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxuICogQG1vZHVsZSBkZWNrXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGlzQXJyYXkgPSByZXF1aXJlKCAnLi9saWIvaXMtYXJyYXknICk7XG5cbi8vIEdldCBhIHJhbmRvbSBpbnRlZ2VyIGluZGV4IHdpdGhpbiB0aGUgcHJvdmlkZWQgYXJyYXlcbmZ1bmN0aW9uIHJhbmRvbUluZGV4KCBhcnIgKSB7XG4gIHJldHVybiBNYXRoLmZsb29yKCBNYXRoLnJhbmRvbSgpICogYXJyLmxlbmd0aCApO1xufVxuXG4vLyBQcmVkaWNhdGUgZnVuY3Rpb24gdG8gZmlsdGVyIG91dCB1bmRlZmluZWQgdmFsdWVzXG5mdW5jdGlvbiBpc05vdFVuZGVmaW5lZCggdmFsICkge1xuICByZXR1cm4gdHlwZW9mIHZhbCAhPT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8vIFNodWZmbGUgYW4gYXJyYXkgaW4gcGxhY2UsIHJldHVybmluZyB0aGF0IGFycmF5XG5mdW5jdGlvbiBzaHVmZmxlKCBhcnIgKSB7XG4gIC8vIEZpc2hlcuKAk1lhdGVzIGltcGxlbWVudGF0aW9uIGFkYXB0ZWQgZnJvbSBodHRwOi8vYm9zdC5vY2tzLm9yZy9taWtlL3NodWZmbGUvXG4gIHZhciByZW1haW5pbmcgPSBhcnIubGVuZ3RoO1xuICB2YXIgdG1wO1xuICB2YXIgaWR4O1xuXG4gIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxl4oCmXG4gIHdoaWxlICggcmVtYWluaW5nICkge1xuICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxuICAgIGlkeCA9IE1hdGguZmxvb3IoIE1hdGgucmFuZG9tKCkgKiByZW1haW5pbmctLSApO1xuXG4gICAgLy8gQW5kIHN3YXAgaXQgd2l0aCB0aGUgY3VycmVudCBlbGVtZW50LlxuICAgIHRtcCA9IGFyclsgcmVtYWluaW5nIF07XG4gICAgYXJyWyByZW1haW5pbmcgXSA9IGFyclsgaWR4IF07XG4gICAgYXJyWyBpZHggXSA9IHRtcDtcbiAgfVxufVxuXG4vKipcbiAqIEBjbGFzcyBEZWNrXG4gKi9cbmZ1bmN0aW9uIERlY2soIGFyciApIHtcbiAgaWYgKCBpc0FycmF5KCBhcnIgKSApIHtcbiAgICB0aGlzLmNhcmRzKCBhcnIgKTtcbiAgfVxufVxuXG4vKipcbiAqIFBvcHVsYXRlIHRoZSBkZWNrIHdpdGggYW4gYXJyYXkgb2YgY2FyZHMsIHdpcGluZyBvdXQgYW55IGNhcmRzIHRoYXQgaGFkXG4gKiBwcmV2aW91c2x5IGJlZW4gYWRkZWQgdG8gdGhlIGRlY2tcbiAqXG4gKiBAY2hhaW5hYmxlXG4gKiBAcGFyYW0gIHtBcnJheX0gY2FyZEFycmF5IEFuIGFycmF5IG9mIGNhcmRzIHRvIHVzZSBmb3IgdGhlIGRlY2tcbiAqIEByZXR1cm4ge0RlY2t9IFRoZSBkZWNrIGluc3RhbmNlIChmb3IgY2hhaW5pbmcpXG4gKi9cbkRlY2sucHJvdG90eXBlLmNhcmRzID0gZnVuY3Rpb24oIGNhcmRBcnJheSApIHtcbiAgaWYgKCAhIGlzQXJyYXkoIGNhcmRBcnJheSApICkgeyByZXR1cm4gdGhpczsgfVxuICAvLyBSZXBsYWNlIHRoZSBkZWNrIHdpdGggdGhlIG5ldyBjYXJkc1xuICB0aGlzLl9zdGFjayA9IGNhcmRBcnJheTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJhbmRvbWl6ZSB0aGUgb3JkZXIgb2YgY2FyZHMgd2l0aGluIHRoZSBkZWNrXG4gKlxuICogQGNoYWluYWJsZVxuICogQHJldHVybiB7RGVja30gVGhlIGRlY2sgaW5zdGFuY2UgKGZvciBjaGFpbmluZylcbiAqL1xuRGVjay5wcm90b3R5cGUuc2h1ZmZsZSA9IGZ1bmN0aW9uKCkge1xuICBzaHVmZmxlKCB0aGlzLl9zdGFjayApO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogR2V0IHRoZSBudW1iZXIgb2YgY2FyZHMgY3VycmVudGx5IGNvbnRhaW5lZCB3aXRoaW4gdGhlIGRlY2tcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBudW1iZXIgb2YgY2FyZHMgbGVmdCBpbiB0aGUgZGVja1xuICovXG5EZWNrLnByb3RvdHlwZS5yZW1haW5pbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX3N0YWNrLmxlbmd0aDtcbn07XG5cbi8qKlxuICogRHJhdyBhIGNhcmQgb3IgY2FyZHMsIHJlbW92aW5nIHRoZSBkcmF3biBjYXJkcyBmcm9tIHRoZSBkZWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFtjb3VudF0gVGhlIG51bWJlciBvZiBjYXJkcyB0byBkcmF3XG4gKiBAcmV0dXJuIHtPYmplY3R8QXJyYXl9IEEgc2luZ2xlIGNhcmQgb3IgYW4gYXJyYXkgb2YgY2FyZHNcbiAqL1xuRGVjay5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCBjb3VudCApIHtcbiAgY291bnQgfHwgKCBjb3VudCA9IDEgKTtcbiAgdmFyIGRyYXduQ2FyZHMgPSB0aGlzLl9zdGFjay5zcGxpY2UoIDAsIGNvdW50ICk7XG4gIGlmICggISBkcmF3bkNhcmRzLmxlbmd0aCApIHsgcmV0dXJuOyB9XG4gIHJldHVybiBjb3VudCA9PT0gMSA/IGRyYXduQ2FyZHNbIDAgXSA6IGRyYXduQ2FyZHM7XG59O1xuXG4vKipcbiAqIERyYXcgYSBjYXJkIG9yIGNhcmRzIGZyb20gdGhlIGJvdHRvbSBvZiB0aGUgZGVjaywgcmVtb3ZpbmcgdGhlIGRyYXduIGNhcmRzXG4gKiBmcm9tIHRoZSBkZWNrXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBbY291bnRdIFRoZSBudW1iZXIgb2YgY2FyZHMgdG8gZHJhd1xuICogQHJldHVybiB7T2JqZWN0fEFycmF5fSBBIHNpbmdsZSBjYXJkIG9yIGFuIGFycmF5IG9mIGNhcmRzXG4gKi9cbkRlY2sucHJvdG90eXBlLmRyYXdGcm9tQm90dG9tID0gZnVuY3Rpb24oIGNvdW50ICkge1xuICBjb3VudCB8fCAoIGNvdW50ID0gMSApO1xuICB2YXIgZHJhd25DYXJkcyA9IHRoaXMuX3N0YWNrLnNwbGljZSggLWNvdW50LCBjb3VudCApLnJldmVyc2UoKTtcbiAgaWYgKCAhIGRyYXduQ2FyZHMubGVuZ3RoICkgeyByZXR1cm47IH1cbiAgcmV0dXJuIGNvdW50ID09PSAxID8gZHJhd25DYXJkc1sgMCBdIDogZHJhd25DYXJkcztcbn07XG5cbi8qKlxuICogRHJhdyBhIGNhcmQgb3IgY2FyZHMgbWF0Y2hpbmcgYSBjb25kaXRpb24gZGVmaW5lZCBpbiBhIHByb3ZpZGVkIHByZWRpY2F0ZVxuICogZnVuY3Rpb24sIHJlbW92aW5nIHRoZSBkcmF3biBjYXJkcyBmcm9tIHRoZSBkZWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcHJlZGljYXRlIEEgZnVuY3Rpb24gdG8gdXNlIHRvIGV2YWx1YXRlIHdoZXRoZXIgYSBnaXZlblxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmQgaW4gdGhlIGRlY2sgc2hvdWxkIGJlIGRyYXduXG4gKiBAcGFyYW0ge051bWJlcn0gW2NvdW50XSBUaGUgbnVtYmVyIG9mIGNhcmRzIHRvIGRyYXdcbiAqIEByZXR1cm4ge09iamVjdHxBcnJheX0gQSBzaW5nbGUgY2FyZCBvciBhbiBhcnJheSBvZiBjYXJkc1xuICovXG5EZWNrLnByb3RvdHlwZS5kcmF3V2hlcmUgPSBmdW5jdGlvbiggcHJlZGljYXRlLCBjb3VudCApIHtcbiAgaWYgKCB0eXBlb2YgcHJlZGljYXRlICE9PSAnZnVuY3Rpb24nICkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb3VudCB8fCAoIGNvdW50ID0gMSApO1xuICB2YXIgZHJhd25DYXJkcyA9IHRoaXMuX3N0YWNrLmZpbHRlciggcHJlZGljYXRlICkuc2xpY2UoIDAsIGNvdW50ICk7XG4gIGZvciAoIHZhciBpID0gMDsgaSA8IGRyYXduQ2FyZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgLy8gUmVtb3ZlIGZyb20gdGhlIHN0YWNrXG4gICAgdGhpcy5fc3RhY2suc3BsaWNlKCB0aGlzLl9zdGFjay5pbmRleE9mKCBkcmF3bkNhcmRzWyBpIF0gKSwgMSApO1xuICB9XG4gIGlmICggISBkcmF3bkNhcmRzLmxlbmd0aCApIHsgcmV0dXJuOyB9XG4gIHJldHVybiBjb3VudCA9PT0gMSA/IGRyYXduQ2FyZHNbIDAgXSA6IGRyYXduQ2FyZHM7XG59O1xuXG4vKipcbiAqIERyYXcgYSBjYXJkIG9yIGNhcmRzIGZyb20gcmFuZG9tIHBvc2l0aW9ucyBpbiB0aGUgZGVjaywgcmVtb3ZpbmcgdGhlIGRyYXduXG4gKiBjYXJkcyBmcm9tIHRoZSBkZWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFtjb3VudF0gVGhlIG51bWJlciBvZiBjYXJkcyB0byBkcmF3XG4gKiBAcmV0dXJuIHtPYmplY3R8QXJyYXl9IEEgc2luZ2xlIGNhcmQgb3IgYW4gYXJyYXkgb2YgY2FyZHNcbiAqL1xuRGVjay5wcm90b3R5cGUuZHJhd1JhbmRvbSA9IGZ1bmN0aW9uKCBjb3VudCApIHtcbiAgaWYgKCAhIHRoaXMuX3N0YWNrLmxlbmd0aCApIHsgcmV0dXJuOyB9XG4gIGNvdW50IHx8ICggY291bnQgPSAxICk7XG4gIGlmICggY291bnQgPT09IDEgKSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YWNrLnNwbGljZSggcmFuZG9tSW5kZXgoIHRoaXMuX3N0YWNrICksIDEgKVsgMCBdO1xuICB9XG4gIHZhciBkcmF3bkNhcmRzID0gW107XG4gIGZvciAoIHZhciBpID0gMDsgaSA8IGNvdW50OyBpKysgKSB7XG4gICAgZHJhd25DYXJkcy5wdXNoKCB0aGlzLl9zdGFjay5zcGxpY2UoIHJhbmRvbUluZGV4KCB0aGlzLl9zdGFjayApLCAxIClbIDAgXSApO1xuICB9XG4gIGRyYXduQ2FyZHMgPSBkcmF3bkNhcmRzLmZpbHRlciggaXNOb3RVbmRlZmluZWQgKTtcbiAgcmV0dXJuIGRyYXduQ2FyZHM7XG59O1xuXG4vKipcbiAqIEluc2VydCBhIGNhcmQgb3IgY2FyZHMgYXQgdGhlIGJvdHRvbSBvZiB0aGUgZGVjayBpbiBvcmRlclxuICpcbiAqIEBjaGFpbmFibGVcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBjYXJkcyBUaGUgY2FyZCBvYmplY3Qgb3IgYXJyYXkgb2YgY2FyZCBvYmplY3RzIHRvIGluc2VydFxuICogQHJldHVybiB7RGVja30gVGhlIGRlY2sgaW5zdGFuY2UgKGZvciBjaGFpbmluZylcbiAqL1xuRGVjay5wcm90b3R5cGUuYWRkVG9Cb3R0b20gPSBmdW5jdGlvbiggY2FyZHMgKSB7XG4gIGlmICggISBpc0FycmF5KCBjYXJkcyApICkge1xuICAgIC8vIEhhbmRsZSBpbmRpdmlkdWFsIGNhcmQgb2JqZWN0c1xuICAgIHJldHVybiB0aGlzLmFkZFRvQm90dG9tKCBbIGNhcmRzIF0gKTtcbiAgfVxuICB0aGlzLl9zdGFjay5wdXNoLmFwcGx5KCB0aGlzLl9zdGFjaywgY2FyZHMgKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEluc2VydCBhIGNhcmQgb3IgY2FyZHMgYXQgdGhlIGJvdHRvbSBvZiB0aGUgZGVjayBpbiByYW5kb20gb3JkZXJcbiAqXG4gKiBAY2hhaW5hYmxlXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gY2FyZHMgVGhlIGNhcmQgb2JqZWN0IG9yIGFycmF5IG9mIGNhcmQgb2JqZWN0cyB0byBpbnNlcnRcbiAqIEByZXR1cm4ge0RlY2t9IFRoZSBkZWNrIGluc3RhbmNlIChmb3IgY2hhaW5pbmcpXG4gKi9cbkRlY2sucHJvdG90eXBlLnNodWZmbGVUb0JvdHRvbSA9IGZ1bmN0aW9uKCBjYXJkcyApIHtcbiAgaWYgKCAhIGlzQXJyYXkoIGNhcmRzICkgKSB7XG4gICAgLy8gSGFuZGxlIGluZGl2aWR1YWwgY2FyZCBvYmplY3RzXG4gICAgcmV0dXJuIHRoaXMuc2h1ZmZsZVRvQm90dG9tKCBbIGNhcmRzIF0gKTtcbiAgfVxuICBzaHVmZmxlKCBjYXJkcyApO1xuICByZXR1cm4gdGhpcy5hZGRUb0JvdHRvbSggY2FyZHMgKTtcbn07XG5cbi8qKlxuICogSW5zZXJ0IGEgY2FyZCBvciBjYXJkcyBhdCB0aGUgdG9wIG9mIHRoZSBkZWNrIGluIG9yZGVyXG4gKlxuICogQGNoYWluYWJsZVxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IGNhcmRzIFRoZSBjYXJkIG9iamVjdCBvciBhcnJheSBvZiBjYXJkIG9iamVjdHMgdG8gaW5zZXJ0XG4gKiBAcmV0dXJuIHtEZWNrfSBUaGUgZGVjayBpbnN0YW5jZSAoZm9yIGNoYWluaW5nKVxuICovXG5EZWNrLnByb3RvdHlwZS5hZGRUb1RvcCA9IGZ1bmN0aW9uKCBjYXJkcyApIHtcbiAgaWYgKCAhIGlzQXJyYXkoIGNhcmRzICkgKSB7XG4gICAgLy8gSGFuZGxlIGluZGl2aWR1YWwgY2FyZCBvYmplY3RzXG4gICAgcmV0dXJuIHRoaXMuYWRkVG9Ub3AoIFsgY2FyZHMgXSApO1xuICB9XG4gIHRoaXMuX3N0YWNrLnVuc2hpZnQuYXBwbHkoIHRoaXMuX3N0YWNrLCBjYXJkcyApO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5zZXJ0IGEgY2FyZCBvciBjYXJkcyBhdCB0aGUgdG9wIG9mIHRoZSBkZWNrIGluIHJhbmRvbSBvcmRlclxuICpcbiAqIEBjaGFpbmFibGVcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBjYXJkcyBUaGUgY2FyZCBvYmplY3Qgb3IgYXJyYXkgb2YgY2FyZCBvYmplY3RzIHRvIGluc2VydFxuICogQHJldHVybiB7RGVja30gVGhlIGRlY2sgaW5zdGFuY2UgKGZvciBjaGFpbmluZylcbiAqL1xuRGVjay5wcm90b3R5cGUuc2h1ZmZsZVRvVG9wID0gZnVuY3Rpb24oIGNhcmRzICkge1xuICBpZiAoICEgaXNBcnJheSggY2FyZHMgKSApIHtcbiAgICAvLyBIYW5kbGUgaW5kaXZpZHVhbCBjYXJkIG9iamVjdHNcbiAgICByZXR1cm4gdGhpcy5zaHVmZmxlVG9Ub3AoIFsgY2FyZHMgXSApO1xuICB9XG4gIHNodWZmbGUoIGNhcmRzICk7XG4gIHJldHVybiB0aGlzLmFkZFRvVG9wKCBjYXJkcyApO1xufTtcblxuLyoqXG4gKiBJbnNlcnQgYSBjYXJkIG9yIGNhcmRzIGludG8gdGhlIGRlY2sgYXQgcmFuZG9tIHBvc2l0aW9uc1xuICpcbiAqIEBjaGFpbmFibGVcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBjYXJkcyBUaGUgY2FyZCBvYmplY3Qgb3IgYXJyYXkgb2YgY2FyZCBvYmplY3RzIHRvIGluc2VydFxuICogQHJldHVybiB7RGVja30gVGhlIGRlY2sgaW5zdGFuY2UgKGZvciBjaGFpbmluZylcbiAqL1xuRGVjay5wcm90b3R5cGUuYWRkUmFuZG9tID0gZnVuY3Rpb24oIGNhcmRzICkge1xuICBpZiAoICEgaXNBcnJheSggY2FyZHMgKSApIHtcbiAgICAvLyBIYW5kbGUgaW5kaXZpZHVhbCBjYXJkIG9iamVjdHNcbiAgICByZXR1cm4gdGhpcy5hZGRSYW5kb20oIFsgY2FyZHMgXSApO1xuICB9XG4gIHZhciBzdGFjayA9IHRoaXMuX3N0YWNrO1xuICBjYXJkcy5mb3JFYWNoKCBmdW5jdGlvbiggY2FyZCApIHtcbiAgICBzdGFjay5zcGxpY2UoIHJhbmRvbUluZGV4KCBzdGFjayApLCAwLCBjYXJkICk7XG4gIH0gKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIExvb2sgYXQgYSBjYXJkIG9yIGNhcmRzIG9uIHRoZSBib3R0b20gb2YgdGhlIGRlY2ssIHdpdGhvdXQgcmVtb3ZpbmcgdGhlbVxuICogZnJvbSB0aGUgZGVja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBUaGUgbnVtYmVyIG9mIGNhcmRzIHRvIHJldHJpZXZlXG4gKiBAcmV0dXJuIHtPYmplY3R8QXJyYXl9IEEgc2luZ2xlIGNhcmQgb3IgYW4gYXJyYXkgb2YgY2FyZHNcbiAqL1xuRGVjay5wcm90b3R5cGUudG9wID0gZnVuY3Rpb24oIGNvdW50ICkge1xuICBpZiAoICEgdGhpcy5fc3RhY2subGVuZ3RoICkgeyByZXR1cm47IH1cbiAgY291bnQgfHwgKCBjb3VudCA9IDEgKTtcbiAgdmFyIHJldHVybmVkQ2FyZHMgPSB0aGlzLl9zdGFjay5zbGljZSggMCwgY291bnQgKTtcbiAgcmV0dXJuIGNvdW50ID09PSAxID8gcmV0dXJuZWRDYXJkc1sgMCBdIDogcmV0dXJuZWRDYXJkcztcbn07XG5cbi8qKlxuICogTG9vayBhdCBhIGNhcmQgb3IgY2FyZHMgb24gdGhlIHRvcCBvZiB0aGUgZGVjaywgd2l0aG91dCByZW1vdmluZyB0aGVtIGZyb21cbiAqIHRoZSBkZWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IFRoZSBudW1iZXIgb2YgY2FyZHMgdG8gcmV0cmlldmVcbiAqIEByZXR1cm4ge09iamVjdHxBcnJheX0gQSBzaW5nbGUgY2FyZCBvciBhbiBhcnJheSBvZiBjYXJkc1xuICovXG5EZWNrLnByb3RvdHlwZS5ib3R0b20gPSBmdW5jdGlvbiggY291bnQgKSB7XG4gIGlmICggISB0aGlzLl9zdGFjay5sZW5ndGggKSB7IHJldHVybjsgfVxuICBjb3VudCB8fCAoIGNvdW50ID0gMSApO1xuICB2YXIgcmV0dXJuZWRDYXJkcyA9ICB0aGlzLl9zdGFjay5zbGljZSggLWNvdW50ICkucmV2ZXJzZSgpO1xuICByZXR1cm4gY291bnQgPT09IDEgPyByZXR1cm5lZENhcmRzWyAwIF0gOiByZXR1cm5lZENhcmRzO1xufTtcblxuLyoqXG4gKiBMb29rIGF0IGEgcmFuZG9tIGNhcmQgb3IgY2FyZHMsIHdpdGhvdXQgcmVtb3ZpbmcgdGhlbSBmcm9tIHRoZSBkZWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IFRoZSBudW1iZXIgb2YgY2FyZHMgdG8gcmV0cmlldmVcbiAqIEByZXR1cm4ge09iamVjdHxBcnJheX0gQSBzaW5nbGUgY2FyZCBvciBhbiBhcnJheSBvZiBjYXJkc1xuICovXG5EZWNrLnByb3RvdHlwZS5yYW5kb20gPSBmdW5jdGlvbiggY291bnQgKSB7XG4gIGlmICggISB0aGlzLl9zdGFjay5sZW5ndGggKSB7IHJldHVybjsgfVxuICBjb3VudCB8fCAoIGNvdW50ID0gMSApO1xuICB2YXIgaWR4O1xuICBpZiAoIGNvdW50ID09PSAxICkge1xuICAgIGlkeCA9IHJhbmRvbUluZGV4KCB0aGlzLl9zdGFjayApO1xuICAgIHJldHVybiB0aGlzLl9zdGFjay5zbGljZSggaWR4LCBpZHggKyAxIClbIDAgXTtcbiAgfVxuICB2YXIgY2FyZHMgPSBbXS5jb25jYXQoIHRoaXMuX3N0YWNrICk7XG4gIHNodWZmbGUoIGNhcmRzICk7XG4gIGNhcmRzLmxlbmd0aCA9IGNvdW50O1xuICByZXR1cm4gY2FyZHMuZmlsdGVyKCBpc05vdFVuZGVmaW5lZCApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEZWNrO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLy8gTG9naWMgYWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9sb2Rhc2gvbG9kYXNoLWNvbXBhdC9ibG9iL21hc3Rlci9sb2Rhc2guanNcbi8vIEFzIG1vc3Qgb2YgdGhpcyBpcyBiYWNrLWNvbXBhdGliaWxpdHkgZm9yIG9sZGVyIGJyb3dzZXJzLCBvbWl0IHRoZXNlXG4vLyBpbXBvc3NpYmxlLXRvLXRlc3QtaW4tbW9kZXJuLW5vZGUgcGF0aHMgZnJvbSBjb3ZlcmFnZSByZXBvcnRpbmdcblxudmFyIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJztcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIGlzVmFsaWRMZW5ndGgoIHZhbCApIHtcbiAgLy8gSWdub3JpbmcgdGhlIG1heC1zYWZlLWludGVnZXIgcnVsZSBiZWNhdXNlIHRoYXQncyB0b28gbWFueSBjYXJkcyBmb3IgYW55IGRlY2tcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdudW1iZXInICYmIHZhbCA+IC0xICYmIHZhbCAlIDEgPT09IDA7XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBpc09iamVjdHkoIHZhbCApIHtcbiAgcmV0dXJuICEgISB2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBpc0FycmF5KCBhcnIgKSB7XG4gIHZhciBpc09iamVjdCA9ICBpc09iamVjdHkoIGFyciApO1xuICB2YXIgaGFzTGVuZ3RoUHJvcGVydHkgPSBpc1ZhbGlkTGVuZ3RoKCBhcnIubGVuZ3RoICk7XG4gIHJldHVybiBpc09iamVjdCAmJiBoYXNMZW5ndGhQcm9wZXJ0eSAmJiBPYmplY3QudG9TdHJpbmcuY2FsbCggYXJyICkgPT09IGFycmF5VGFnO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuLy8gVHJ5IHRoZSBuYXRpdmUgbWV0aG9kIGZpcnN0LCB0aGVuIGZhbGwgYmFjayB0byBvdXIgYmFjay1jb21wYXRpYmlsaXR5IG1ldGhvZFxubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGlzQXJyYXk7XG4iXX0=
