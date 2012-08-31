console.log('breakball active');

/*
 * @jQuery()[0] returns the html element associated w/ the jQuery object
 * @mainCanvas holds the canvas DOM object, giving us access to it's canvassy goodness... haha "canvassy"
*/
var mainCanvas = $('#breakball')[0];

/* 
 * @method getContext returns a new object for the contextId
 * @ard 2d requests the 2d context of the canvas. 2d context according to the whatwg is The 2D context represents a 
 * flat Cartesian surface whose origin (0,0) is at the top left corner, with the coordinate space having x values increasing when going right, and y values increasing when going down. 
 * get the 2d context of the canvas, the context is kind of like the controller that allows you to alter the canvas.
*/
var breakball = mainCanvas.getContext('2d');

//paddle info
var paddleX = 150;
var paddleY = 460;
var paddleWidth = 100;
var paddleHeight = 15;
var paddleDeltaX = 0;
var paddleSpeedX = 10;
var paddleDirection = 'stop';

// use fillRect() method to create a simple rectangle, canvas also has a fillText() method baked in
// for other items we'll use a different process which you'll see below.
function drawPaddle() {
	breakball.fillStyle = 'rgb(0, 0, 0)';
	breakball.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
}

function movePaddle() {
	if (paddleDirection == 'left') {
		paddleDeltaX = -paddleSpeedX;
	} else if (paddleDirection == 'right') {
		paddleDeltaX = paddleSpeedX;
	} else {
		paddleDeltaX = 0;
	}
	
	if ((paddleX + paddleDeltaX < 0) || (paddleX + paddleDeltaX + paddleWidth > mainCanvas.width)) {
		paddleDeltaX = 0;
	}
	
	paddleX +=paddleDeltaX;
}

//ball stuff
var ballX = 150;
var ballY = 300;
var ballDeltaX = 0;
var ballDeltaY = 0;
var ballRadius = 10;

//use .arc() method to draw a circle. the spec for .arc(int x, int y, int radius, int startAngle, int endAngle, boolean anticlockwise)
function drawBall() {
	//begin drawing a path
	breakball.beginPath();
		
	//the path I want is an arc, at (300,300) with a radius of 10px (20px wide), starting at 0 and going 2pi(360 degrees), and counterclockwise for fun
	breakball.arc(ballX, ballY, ballRadius, 0, Math.PI*2, true);
		
	//now I have this great path, please go ahead fill her up -- this is important w/ building custom shapes, start the path, tell it what to do, and then fill it if you want.
	breakball.fillStyle = 'rgb(0, 0, 0)';
	breakball.fill();
};

function moveBall() {
	//if ball hits top or block turn it around
	if (ballY + ballDeltaY - ballRadius < 0 || hitBrickY()) {
		ballDeltaY = -ballDeltaY;
	}
	
	//if ball hits bottom turn it around
	if (ballY + ballDeltaY + ballRadius > mainCanvas.height) {
		youSuck();
	}
	
	//if ball hits the sides flip it around
	if ((ballX + ballDeltaX - ballRadius < 0) || (ballX + ballDeltaX + ballRadius > mainCanvas.width) || hitBrickX()) {
		ballDeltaX = -ballDeltaX;
	}
	
	//if ball hits the paddle flip it around
	if (ballY + ballDeltaY + ballRadius >= paddleY) {
		if ((ballX + ballDeltaX >= paddleX) && (ballX + ballDeltaX <= paddleX + paddleWidth)) {
			ballDeltaY = -ballDeltaY;
		}
	}

	ballX = ballX + ballDeltaX;
	ballY = ballY + ballDeltaY;
};

//brick information
//the most important thing here is the brickPattern array, it holds an array that represents each row and it's respective bricks
// the 1 means brick 0 means no brick
var bricksPerRow = 10;
var brickHeight = 20;
var brickWidth = mainCanvas.width / bricksPerRow;
var brickPattern = [
	[1,1,1,1,1,1,0,1,1,1],
	[0,1,0,1,1,0,1,1,0,1],
	[1,0,1,1,1,0,1,0,1,1],
	[1,1,0,0,1,1,0,1,0,1]
];

//@function drawBrick is the method we will use to draw each brick,
//it checks for either a 1 or a 0 to know what to do
function drawBrick(x, y, type) {
	if (type == 1) {
		//fillStyle allows me to make my rectangle a different color yay! i like green!
		breakball.fillStyle = 'rgb(0, 255, 0)';
		
		//go ahead and fill the area
		breakball.fillRect(x * brickWidth, y * brickHeight, brickWidth, brickHeight);
		
		//give them a stroke for definition, strokeRect is much like fillRect, just makes an outline instead
		breakball.strokeRect(x * brickWidth + 1, y * brickHeight + 1, brickWidth - 2, brickHeight - 2);
	} else {
		//assume 0 if not 1
		//if 0 go ahead and use .clearRect to delete it. takes the x, y, width, and height of an area you want ot delete.
		breakball.clearRect(x * brickWidth, y * brickHeight, brickWidth, brickHeight);
	}
};
	
//the first loop goes throw the brickPattern array, the second goes through the array that holds the row information
//here j and i become synonomous with the x and y of the upper left hand corner of each brick
//for example when this
//drawBrick(3, 2, brickPattern[2][3]
//means draw me a brick where the 3rd brick in the 2nd row using the specs for that brick in the brickPattern array
function generateBricks() {
	for (var i = 0; i < brickPattern.length; i++) {
		for (var j = 0; j < brickPattern[i].length; j++) {
			drawBrick(j, i, brickPattern[i][j]);
		}
	}
};

//collision controls
function hitBrickX() {
	var bumped = false;
	
	for (var i = 0; i < brickPattern.length; i++) {
		for (var j = 0; j < brickPattern[i].length; j++) {
			if (brickPattern[i][j]) {
				var brickX = j * brickWidth;
				var brickY = i * brickHeight;
        
				if (((ballX + ballDeltaX + ballRadius >= brickX) && (ballX + ballRadius <= brickX))
        || ((ballX + ballDeltaX - ballRadius <= brickX + brickWidth) && (ballX - ballRadius >= brickX + brickWidth))) {     
        	if ((ballY + ballDeltaY -ballRadius <= brickY + brickHeight) && (ballY + ballDeltaY + ballRadius >= brickY)) {
						weakenBrick(i, j);
						bumped = true;
          }
        }				
			}
		}
	}

	return bumped;
}

function hitBrickY() {
	var bumped = false;
	
	for (var i = 0; i < brickPattern.length; i++) {
		for (var j = 0; j < brickPattern[i].length; j++) {
			if (brickPattern[i][j]) {
				var brickX = j * brickWidth;
				var brickY = i * brickHeight;
				if (((ballY + ballDeltaY - ballRadius <= brickY + brickHeight) && (ballY - ballRadius >= brickY + brickHeight))
					|| ((ballY + ballDeltaY + ballRadius >= brickY) && (ballY + ballRadius <= brickY ))) {
					if (ballX + ballDeltaX + ballRadius >= brickX &&
				  	ballX + ballDeltaX - ballRadius<= brickX + brickWidth) {
								
						weakenBrick(i, j);
						bumped = true;
				  }				
				}
			}
		}
	}
	
	return bumped;
}

function weakenBrick(i, j) {
	console.log('hit');
	brickPattern[i][j] = j - 1;
}

function updateScreen() {
	//clear canvas before rewriting
	breakball.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
	
	//update canvas
	moveBall();
  movePaddle();

  generateBrick();
	drawPaddle();
	drawBall();
};

function trackPaddle() {
	$(document).keydown(function(event) {
		if (event.keyCode == 39) {
			paddleDirection = 'right';
		} else if (event.keyCode == 37) {
			paddleDirection = 'left';
		}	
	});

	$(document).keyup(function(event) {
		if (event.keyCode == 39) {
			paddleDirection = 'stop';
		} else if (event.keyCode == 37) {
			paddleDirection = 'stop';
		}	
	});
}

function initGame() {
	ballDeltaY = -4;
	ballDeltaX = -2;
	
	trackPaddle();
	gameLoop = setInterval(updateScreen, 10);
	function test() {
		console.log(brickPattern);
	}
};

function youSuck() {
	clearInterval(gameLoop);
	$('#over').addClass('show');
};

$(document).ready(function() {
	$('#start-game').click(function() {
		$('#start-game').hide();
		initGame();
	});
});




