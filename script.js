// Get the canvas and set up drawing context
let canvas = document.querySelector("#canvas");
let ctx = canvas.getContext("2d");
let width = canvas.width;
let height = canvas.height;

const MAX_COMPUTER_SPEED = 2; // Speed at which the left paddle (AI) moves
const BALL_SIZE = 5;

let ballPosition;
let xSpeed;
let ySpeed;

// Initialize ball position and speed
function initBall() {
    ballPosition = { x: 20, y: 30 };
    xSpeed = 4;
    ySpeed = 2;
}

// Paddle constants
const PADDLE_WIDTH = 5;
const PADDLE_HEIGHT = 20;
const PADDLE_OFFSET = 10;

// Paddle positions
let leftPaddleTop = 10;
let rightPaddleTop = 30;

// Score variables
let leftScore = 0;
let rightScore = 0;
let gameOver = false;

// Move right paddle with mouse
document.addEventListener("mousemove", (e) => {
    rightPaddleTop = e.y - canvas.offsetTop;
});

// Game restart
document.addEventListener("keydown", () => {
    if (gameOver) {
        leftScore = 0;
        rightScore = 0;
        gameOver = false;
        initBall();
        gameLoop();
    }
});


// Draw everything on the canvas
function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "White";

    // Draw ball
    ctx.fillRect(ballPosition.x, ballPosition.y, BALL_SIZE, BALL_SIZE);

    // Draw paddles
    ctx.fillRect(PADDLE_OFFSET, leftPaddleTop, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(
        width - PADDLE_WIDTH - PADDLE_OFFSET,
        rightPaddleTop,
        PADDLE_WIDTH,
        PADDLE_HEIGHT
    );

    // Draw scores
    ctx.font = "30px monospace";
    ctx.textAlign = "left";
    ctx.fillText(leftScore.toString(), 50, 50);
    ctx.textAlign = "right";
    ctx.fillText(rightScore.toString(), width - 50, 50);
}

// Simple AI: moves left paddle toward ball
function followBall() {
    let ball = {
        top: ballPosition.y,
        bottom: ballPosition.y + BALL_SIZE,
    };

    let leftPaddle = {
        top: leftPaddleTop,
        bottom: leftPaddleTop + PADDLE_HEIGHT, // ← FIXED: previously wrong
    };

    if (ball.top < leftPaddle.top) {
        leftPaddleTop -= MAX_COMPUTER_SPEED;
    } else if (ball.bottom > leftPaddle.bottom) {
        leftPaddleTop += MAX_COMPUTER_SPEED;
    }
}

// Update ball position and AI paddle
function update() {
    ballPosition.x += xSpeed;
    ballPosition.y += ySpeed;
    followBall();
}

// Check if ball collides with paddle
function checkPaddleCollision(ball, paddle) {
    return (
        ball.left < paddle.right &&
        ball.right > paddle.left &&
        ball.top < paddle.bottom &&
        ball.bottom > paddle.top
    );
}

// Adjust ball angle based on where it hits the paddle
function adjustAngle(distanceFromTop, distanceFromBottom) {
    if (distanceFromTop < 0) {
        ySpeed -= 0.5;
    } else if (distanceFromBottom < 0) {
        ySpeed += 0.5;
    }
}

// Handle collisions and scoring
function checkCollision() {
    let ball = {
        left: ballPosition.x,
        right: ballPosition.x + BALL_SIZE,
        top: ballPosition.y,
        bottom: ballPosition.y + BALL_SIZE,
    };

    let leftPaddle = {
        left: PADDLE_OFFSET,
        right: PADDLE_OFFSET + PADDLE_WIDTH,
        top: leftPaddleTop,
        bottom: leftPaddleTop + PADDLE_HEIGHT,
    };

    let rightPaddle = {
        left: width - PADDLE_WIDTH - PADDLE_OFFSET,
        right: width - PADDLE_OFFSET,
        top: rightPaddleTop,
        bottom: rightPaddleTop + PADDLE_HEIGHT,
    };

    // Check for left paddle collision
    if (checkPaddleCollision(ball, leftPaddle)) {
        let distanceFromTop = ball.top - leftPaddle.top;
        let distanceFromBottom = leftPaddle.bottom - ball.bottom;
        adjustAngle(distanceFromTop, distanceFromBottom);
        xSpeed = Math.abs(xSpeed); // Ball bounces to the right
    }

    // Check for right paddle collision
    if (checkPaddleCollision(ball, rightPaddle)) {
        let distanceFromTop = ball.top - rightPaddle.top;
        let distanceFromBottom = rightPaddle.bottom - ball.bottom;
        adjustAngle(distanceFromTop, distanceFromBottom);
        xSpeed = -Math.abs(xSpeed); // Ball bounces to the left
    }

    // If ball goes past left paddle
    if (ball.left < 0) {
        rightScore++;
        initBall(); // Reset ball
    }

    // If ball goes past right paddle
    if (ball.right > width) {
        leftScore++;
        initBall(); // Reset ball
    }

    // End game at 10 points
    if (leftScore > 9 || rightScore > 9) {
        gameOver = true;
    }

    // Bounce off top or bottom
    if (ball.top < 0 || ball.bottom > height) {
        ySpeed = -ySpeed;
    }
}

// Draw game over text
function drawGameOver() {
    ctx.fillStyle = "White";
    ctx.font = "30px monospace";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", width / 2, height / 2);
}

// Main loop
function gameLoop() {
    draw();
    update();
    checkCollision();

    if (gameOver) {
        draw(); // Redraw game state
        drawGameOver(); // Show game over
    } else {
        setTimeout(gameLoop, 30); // Repeat loop
    }
}

// Start the game
initBall();
gameLoop();
