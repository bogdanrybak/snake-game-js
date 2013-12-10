'use strict';

/**
 * Main game object
 * @type {Object}
 * @param {string} [canvasId] id of the canvas where the game needs to take place
 */
var Game = function(canvasId) {
  var ctx = document.getElementById(canvasId).getContext('2d');

  var clearCanvas = function() {
    // Store the current transformation matrix
    ctx.save();
    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, stage.width, stage.height);
    // Restore the transform
    ctx.restore();
  };

  /**
   * Settings
   */
  var stage = {
    width: 480,
    height: 320,
    speed: 600 // speed of the game - lower is faster
  };

  var KEYS = {
    left: 37,
    up: 38,
    right: 39,
    down: 40
  };

  /**
   * Game related variables and init
   */
  var intervalId;
  var snake = new Snake(stage.width / 2, stage.height / 2, 3);
  var food = new Food();

  // starting input direction
  var direction = {
    axis: 'x',
    sign: -1
  };

  var draw = function() {
    clearCanvas(ctx);
    snake.move(direction);
    if (food) {
      food.draw();
    }

    if (snake.ate(food)) {
      food = new Food();
      food.draw();
    }
    snake.draw();
  };

  var init = function() {
    snake.draw();
    intervalId = window.setInterval(draw, stage.speed);
  };

  var stop = function() {
    window.clearInterval(intervalId);
  };

  var keyListener = function(e) {
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
  };

  document.onkeydown = keyListener;

  var deadScreen = function() {
    stop();
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('YOU DEAD', 50, 50);
  };

  /**
   * Snake constructor takes initial position of the snake and number of segments to start with
   * @param {float} [x]
   * @param {float} [y]
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
    this.length = 0;

    this.bottomEdge = function () {
      return this.y + this.height;
    };
    this.rightEdge = function () {
      return this.x + this.width;
    };

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
      this.length++;
    };

    this.segments = [];

    for (var i = 0; i < segments; i++) {
      this.addSegment(this.x + this.width * i, this.y, true);
    }
  }

  Snake.prototype.draw = function() {

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
    if (this.x < 0 || this.rightEdge() > stage.width ||
        this.y < 0 || this.bottomEdge() > stage.height) {

      deadScreen();
    } else {
      // Draw the next segment and remove the previous one
      this.addSegment(this.x, this.y);
      this.segments.pop();
    }

    // Assign new direction to the snake
    if (!movingOpposite) {
      this.direction = {
        axis: direction.axis,
        sign: direction.sign
      };
    }

  };

  Snake.prototype.ate = function(food) {
    var overlapX = this.x >= food.x && this.x <= (food.x + food.size);
    var overlapY = this.y >= food.y && this.y <= (food.y + food.size);
    if (overlapX && overlapY) {
      var lastSegment = this.segments[this.segments.length - 1];
      this.addSegment(lastSegment.x + this.width * this.direction.sign, lastSegment.y + this.height * this.direction.sign, true);
      return true;
    }
    return false;
  };

  function Food(x, y) {
    this.size = 20;
    this.x = x || snapToGrid(Math.random() * (stage.width - this.size));
    this.y = y || snapToGrid(Math.random() * (stage.height - this.size));
    this.color = '#377ABD';

    this.draw = function() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2, 0, Math.PI*2, false);
      ctx.fill();
    };
  }

  function snapToGrid(coordinate) {
    coordinate = Math.floor(coordinate);
    var remainder = coordinate % 20;
    return coordinate - remainder;
  }

  return {
    init: init,
    stop: stop
  };
};

var game = new Game('game-screen');
game.init();