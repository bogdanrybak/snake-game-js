'use strict';

/**
 * Main game object
 * @type {Object}
 * @param {string} canvasId id of the canvas where the game needs to take place
 * @param {string} scoreBoardId id of the element where the score number will be displayed
 */
var Game = function(canvasId, scoreBoardId) {
  var ctx = document.getElementById(canvasId).getContext('2d');
  var scoreBoard = document.getElementById(scoreBoardId);
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
    grid: 20, // size of the grid the snake and food are supposed to abide by
    speed: 200 // speed of the game - lower is faster
  };

  var KEYS = {
    left: 37,
    up: 38,
    right: 39,
    down: 40
  };

  var colors = {
    snake: '#FFFFFF',
    food: '#EC4A36'
  };

  /**
   * Game related variables and init
   */
  var intervalId;
  var snakeStartingLength = 3;
  var snake;
  var food;

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

    if (snake.selfCollided()) {
      deadScreen();
    }

    snake.draw();
    updateScore();
  };

  var start = function() {
    clearCanvas(ctx);
    // check if game already in progress
    if (intervalId) { stop(); }

    ctx.globalCompositeOperation = 'source-over';
    // prepare the objects
    snake = new Snake(stage.width / 2, stage.height / 2, snakeStartingLength);
    food = new Food();
    snake.draw();
    // start the game
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

  var updateScore = function() {
    scoreBoard.innerHTML = snake.length;
  };

  var deadScreen = function() {
    stop();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = colors.food;
    ctx.textAlign = 'center';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('YOU DEAD', stage.width/2, stage.height/2);
  };

  /**
   * Snake constructor takes initial position of the snake and number of segments to start with
   * @param {float} x
   * @param {float} y
   * @param {int} segments number of segments the work should be costructed with
   */
  function Snake(x, y, segments) {
    this.height = stage.grid;
    this.width = this.height;
    this.x = snapToGrid(x);
    this.y = snapToGrid(y);
    this.speed = this.height;
    this.color = colors.snake;
    this.direction = {
      axis: 'x',
      sign: -1
    };
    this.length = 0;
    this.tailPosition = {};

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
      this.tailPosition = {
        x: this.segments[this.segments.length - 1].x,
        y: this.segments[this.segments.length - 1].y
      };
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
    var overlapX = this.x == food.x;
    var overlapY = this.y == food.y;
    if (overlapX && overlapY) {
      this.addSegment(this.tailPosition.x, this.tailPosition.y, true);
      this.length++;
      return true;
    }
    return false;
  };

  Snake.prototype.selfCollided = function() {
    // start counting from one ignoring the head segment
    for (var i = 1; i < this.segments.length; i++) {
      if (this.segments[i].x === this.segments[0].x &&
          this.segments[i].y === this.segments[0].y) {
        return true;
      }
    }
    return false;
  };

  function Food(x, y) {
    this.size = stage.grid;
    this.x = x || snapToGrid(Math.random() * (stage.width - this.size));
    this.y = y || snapToGrid(Math.random() * (stage.height - this.size));
    this.color = colors.food;

    this.draw = function() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2, 0, Math.PI*2, false);
      ctx.fill();
    };
  }

  // Utility function to align a value to the grid
  function snapToGrid(coordinate) {
    coordinate = Math.floor(coordinate);
    var remainder = coordinate % stage.grid;
    return coordinate - remainder;
  }

  return {
    start: start,
    stop: stop
  };
};