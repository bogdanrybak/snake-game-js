'use strict';
/**
 * Initialization of canvas and other settings
 */

var ctx = document.getElementById('game-screen').getContext('2d');

var Stage = {
  width: 480,
  height: 320,
  frameSpeed: 30
};

var KEYS = {
  left: '37',
  up: '38',
  right: '39',
  down: '40'
};

var direction = 'left';

/**
 * Snake constructor takes initial position of the snake
 * @param {float} x
 * @param {float} y
 */
function Snake(x, y) {
  this.length = 3; // length in segments
  this.height = 20;
  this.width = this.height * this.length;
  this.x = x - this.width / 2;
  this.y = y - this.height / 2;
  this.speed = 1;
  this.color = 'rgb(200,0,0)';
}

Snake.prototype.draw = function() {
  ctx.fillStyle = this.color;
  ctx.fillRect(this.x, this.y, this.width, this.height);
};


function draw() {
  var snake = new Snake(Stage.width / 2, Stage.height / 2);
  snake.draw();
}

draw();