'use strict';
/**
 * Initialization of canvas and other settings
 */

var ctx = document.getElementById('game-screen').getContext('2d');

var Stage = {
  width: 480,
  height: 320,
  frameSpeed: 800
};

var KEYS = {
  left: 37,
  up: 38,
  right: 39,
  down: 40
};

function clearCanvas(ctx) {
  // Store the current transformation matrix
  ctx.save();
  // Use the identity matrix while clearing the canvas
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, Stage.width, Stage.height);
  // Restore the transform
  ctx.restore();
}

/**
 * Snake constructor takes initial position of the snake
 * @param {float} x
 * @param {float} y
 * @param {int} [segments] [number of segments the work should be costructed with]
 */
function Snake(x, y, segments) {
  this.height = 20;
  this.width = this.height;
  this.x = x;
  this.y = y;
  this.speed = this.height;
  this.color = 'rgb(200,0,0)';
  this.direction = {
    axis: 'x',
    sign: -1
  };

  this.bottomEdge = function () {
    return this.y + this.height;
  };
  this.rightEdge = function () {
    return this.x - this.width;
  }

  this.addSegment = function (x, y, toEnd) {
    var block = {
      width: this.height,
      height: this.height,
      x: x,
      y: y
    };

    if (toEnd) {
      this.segments.push(block);
    } else {
      this.segments.unshift(block);
    }
  };

  this.segments = [];

  for (var i = 0; i < segments; i++) {
    this.addSegment(this.x + this.width * i, this.y, true);
  }
}

Snake.prototype.draw = function() {
  clearCanvas(ctx);

  ctx.fillStyle = this.color;
  for (var i = 0; i < this.segments.length; i++) {
    ctx.fillRect(this.segments[i].x, this.segments[i].y, this.segments[i].width, this.segments[i].height);
  }
};

Snake.prototype.move = function(direction) {
  // See if the input is trying to make the snake move back into itself.
  var movingOpposite = this.direction.axis === direction.axis && this.direction.sign != direction.sign;
  var moveBy = movingOpposite ? this.width * this.direction.sign : this.width * direction.sign;

  // Set the head position of the snake
  if (direction.axis === 'x') {
    this.x = this.x + moveBy;
  } else if (direction.axis === 'y') {
    this.y = this.y + moveBy;
  }

  // Check if not hitting the walls
  if (this.x < 0 || this.rightEdge() > Stage.width ||
      this.y < 0 || this.bottomEdge() > Stage.height) {

    Game.deadScreen(ctx);
  } else {
    // Draw the next segment and remove the previous one
    this.addSegment(this.x, this.y);
    this.segments.pop();
    this.draw();
  }

  // Assign new direction to the snake
  if (!movingOpposite) {
    this.direction = {
      axis: direction.axis,
      sign: direction.sign
    };
  }

};

/**
 * Main game object
 * @type {Object}
 */
var Game = (function() {
  var intervalId;

  var snake = new Snake(Stage.width / 2, Stage.height / 2, 3);

  var direction = {
    axis: 'x',
    sign: -1
  };

  /**
   * Main draw function
   */
  var draw = function() {
    snake.move(direction);
  };

  var stop = function() {
    window.clearInterval(intervalId);
  };

  var init = function() {
    snake.draw();
    intervalId = window.setInterval(draw, Stage.frameSpeed);
  }

  function keyListener(e) {
    e = e || window.event;

    switch (e.keyCode) {
    case KEYS.left:
      direction = { axis: 'x', sign: -1 };
      break;
    case KEYS.right:
      direction = { axis: 'x', sign: 1 };
      break;
    case KEYS.down:
      direction = { axis: 'y', sign: 1 };
      break;
    case KEYS.up:
      direction = { axis: 'y', sign: -1 };
      break;
    }
  }

  document.onkeydown = keyListener;

  return {
    init: init,
    stop: stop,
    direction: function() {
      return direction;
    },
    deadScreen: function(ctx) {
      stop();
      ctx.fillStyle = 'black';
      ctx.strokeStyle = 'black';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('YOU DEAD', 50, 50);
    }
  };
})();

Game.init();