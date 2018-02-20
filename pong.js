var animate =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  // this will call the callback function 60 frames per sec
  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };

//create the canvas and add the properties
var canvas = document.createElement("canvas");
var width = 400;
var height = 600;
var computerScore = 0;
var playerScore = 0;
canvas.width = width;
canvas.height = height;

//get the context
var context = canvas.getContext("2d");

var Paddle = function(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.x_speed = 0;
  this.y_speed = 0;
};

Paddle.prototype.render = function() {
  context.fillStyle = "#0000FF";
  context.fillRect(this.x, this.y, this.width, this.height);
};

Paddle.prototype.move = function(x, y) {
  this.x += x;
  this.y += y;
  this.x_speed = x;
  this.y_speed = y;
  if (this.x < 0) {
    // all the way to the left
    this.x = 0;
    this.x_speed = 0;
  } else if (this.x > 400) {
    // all the way to the right
    this.x = 400 - this.width;
    this.x_speed = 0;
  }
};

function Player() {
  this.paddle = new Paddle(175, 580, 50, 10);
}

function Computer() {
  this.paddle = new Paddle(175, 10, 50, 10);
}

Player.prototype.render = function() {
  this.paddle.render();
};

Player.prototype.update = function() {
  for (var key in keyDown) {
    var value = Number(key);
    if (value == 37) {
      // left arrow
      this.paddle.move(-4, 0);
    } else if (value == 39) {
      //right arrow
      this.paddle.move(4, 0);
    } else {
      this.paddle.move(0, 0);
    }

    if (this.paddle.x < 0) {
      this.paddle.x = 0;
    } else if (this.paddle.x + this.paddle.width > 400) {
      this.paddle.x = 400 - this.paddle.width;
    }
  }
};

Computer.prototype.render = function() {
  this.paddle.render();
};

Computer.prototype.update = function(ball) {
  var x_pos = ball.x;
  // -5 > diff > 0  this mean the ball is on the left side of the map
  // 0 > diff > 5  this mean the ball is on the right side of the map
  var diff = -(this.paddle.x + this.paddle.width / 2 - x_pos);
  if (diff < 0 && diff < -4) {
    // max speed left
    diff = -5;
  } else if (diff > 0 && diff > 4) {
    // max speed right
    diff = 5;
  }
  this.paddle.move(diff, 0);
  if (this.paddle.x < 0) {
    this.paddle.x = 0;
  } else if (this.paddle.x + this.paddle.width > 400) {
    this.paddle.x = 400 - this.paddle.width;
  }
};

function Ball(x, y) {
  this.x = x;
  this.y = y;
  this.x_speed = 0;
  this.y_speed = 3;
  this.radius = 5;
  this.isInitState = true;
}

Ball.prototype.render = function() {
  context.beginPath();
  context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
  context.fillStyle = "#FFFFFF";
  context.fill();
};

Ball.prototype.update = function(paddle1, paddle2) {
  this.x += this.x_speed;
  this.y += this.y_speed;
  var top_x = this.x - 5;
  var top_y = this.y - 5;
  var bottom_x = this.x + 5;
  var bottom_y = this.y + 5;

  if (this.x - 5 < 0) {
    // hits the left wall
    console.log("hit left wall");
    this.x = 5;
    this.x_speed = -this.x_speed;
  } else if (this.x + 5 > 400) {
    // hits the right wall
    this.x = 395;
    this.x_speed = -this.x_speed;
  }

  if (this.y < 0) {
    // player scored a point
    playerScore += 1;

    this.x_speed = 0;
    this.y_speed = 3;
    // reset
    this.x = 200;
    this.y = 300;
  } else if (this.y > 600) {
    // computer scored a point
    computerScore += 1;

    this.x_speed = 0;
    this.y_speed = 3;
    // reset
    this.x = 200;
    this.y = 300;
  }
  /*

              top_y
               -----
     top_x    |     | bottom_x
              |     |
               -----
               bottom_y

  */

  if (top_y > 300) {
    if (
      top_y < paddle1.y + paddle1.height &&
      bottom_y > paddle1.y &&
      top_x < paddle1.x + paddle1.width &&
      bottom_x > paddle1.x
    ) {
      // hits the player paddle
      this.y_speed = -3;
      this.x_speed += paddle1.x_speed / 2;
      this.y += this.y_speed;
    }
  } else {
    if (
      top_y < paddle2.y + paddle2.height &&
      bottom_y > paddle2.y &&
      top_x < paddle2.x + paddle2.width &&
      bottom_x > paddle2.x
    ) {
      // hits the computer paddle
      this.y_speed = 3;
      this.x_speed += paddle2.x_speed / 2;
      this.y += this.y_speed;
    }
  }
};

var player = new Player();
var computer = new Computer();
var ball = new Ball(200, 300);

var keyDown = {};

window.addEventListener("keydown", function(event) {
  console.log("addEventListener");
  keyDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
  delete keyDown[event.keyCode];
});

var render = function() {
  // background color
  context.fillStyle = "#000000";
  context.fillRect(0, 0, width, height);

  // add middle line
  context.strokeStyle = "#0000FF";
  context.moveTo(0, height / 2);
  context.lineTo(width, height / 2);
  context.stroke();

  // add score to both players
  context.font = "30px Arial";
  context.fillStyle = "#0000FF";
  context.fillText(computerScore, 0, height / 2 - 200);

  context.font = "30px Arial";
  context.fillStyle = "#0000FF";
  context.fillText(playerScore, 0, height / 2 + 200);

  // press space to play message
  if (ball.isInitState === true) {
    context.font = "30px Arial";
    context.fillStyle = "#0000FF";
    context.fillText("Press space to play", 70, height / 2 - 100);
  } else {
    context.font = "30px Arial";
    context.fillStyle = "#000000";
    context.fillText("Press space to play", 70, height / 2 - 100);
  }

  player.render();
  computer.render();
  ball.render();
};

var update = function() {
  if (ball.isInitState === true) {
    for (var key in keyDown) {
      var value = Number(key);
      if (value === 32) {
        ball.isInitState = false;
      }
    }
  }
  if (ball.isInitState === false) {
    player.update();
    computer.update(ball);
    ball.update(player.paddle, computer.paddle);
  }
};

var step = function() {
  update();
  render();
  animate(step);
};

var renderInit = function() {
  render();
};

window.onload = function() {
  document.body.appendChild(canvas);
  // renderInit();
  animate(step);
};
