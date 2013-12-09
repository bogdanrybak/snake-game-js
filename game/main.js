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
 */
function Snake(x, y) {
  this.length = 1; // length in segments
  this.height = 20;
  this.width = this.height * this.length;
  this.x = x - this.width / 2;
  this.y = y - this.height / 2;
  this.speed = this.height;
  this.color = 'rgb(200,0,0)';
  this.direction = 'left';
}

Snake.prototype.draw = function() {
  clearCanvas(ctx);

  ctx.fillStyle = this.color;
  ctx.fillRect(this.x, this.y, this.width, this.height);
};

Snake.prototype.move = function(axis, sign) {
  if (axis === 'x') {
    this.x = this.x + (sign * this.speed);
  } else if (axis === 'y') {
    this.y = this.y + (sign * this.speed);
  }
};

var direction = {
  axis: 'x',
  sign: -1
};
var snake;

function init() {
  snake = new Snake(Stage.width / 2, Stage.height / 2);
  snake.draw();
  setInterval(draw, Stage.frameSpeed);
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

function draw() {
  snake.move(direction.axis, direction.sign);
  snake.draw();
}

init();