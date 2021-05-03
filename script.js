const rulesBtn = document.getElementById('rules-btn');
const closeBtn = document.getElementById('close-btn');
const rules = document.getElementById('rules');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let score = 0;
let level = 1;
let laserSound;
let explosionSound;

const brickRowCount = 5;
const brickColumnCount = 9;

// create ball props
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 2,
  dx: 4,
  dy: -4,
};

// create paddle props
const paddle = {
  x: canvas.width / 2 - 40,
  y: canvas.height - 40,
  w: 80,
  h: 10,
  speed: 8,
  dx: 0,
};

// create brick props
const brickInfo = {
  w: 70,
  h: 20,
  padding: 10,
  offsetX: 45,
  offsetY: 60,
  visible: true,
};

// create bricks
const bricks = [];
for (let i = 0; i < brickColumnCount; i++) {
  bricks[i] = [];
  for (let j = 0; j < brickRowCount; j++) {
    const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
    const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
    bricks[i][j] = { x, y, ...brickInfo };
  }
}

// draw ball on canvas
const drawBall = () => {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = '#00dda6';
  ctx.fill();
  ctx.closePath();
};

// draw paddle on canvas
const drawPaddle = () => {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = '#00dda6';
  ctx.fill();
  ctx.closePath();
};

// draw bricks on canvas
const drawBricks = () => {
  bricks.forEach((column) => {
    column.forEach((brick) => {
      ctx.beginPath();
      ctx.rect(brick.x, brick.y, brick.w, brick.h);
      ctx.fillStyle = brick.visible ? '#dd0067' : 'transparent';
      ctx.fill();
      ctx.closePath();
    });
  });
};

// display score on canvas
const drawScore = () => {
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, canvas.width - 100, 30);
};

// display level on canvas
const drawLevel = () => {
  ctx.font = '20px Arial';
  ctx.fillText(`Level: ${level}`, canvas.width - 780, 30);
};

// move paddle on canvas
const movePaddle = () => {
  paddle.x += paddle.dx;
  // wall detection
  if (paddle.x + paddle.w > canvas.width) paddle.x = canvas.width - paddle.w;
  if (paddle.x < 0) paddle.x = 0;
};

// move ball
const moveBall = () => {
  ball.x += ball.dx;
  ball.y += ball.dy;
  // Wall collision left and right
  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0)
    ball.dx *= -1;
  // Wall collision top and bottom
  if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0)
    ball.dy *= -1;
  // Paddle collision
  if (
    ball.x - ball.size > paddle.x &&
    ball.x + ball.size < paddle.x + paddle.w &&
    ball.y + ball.size > paddle.y
  ) {
    ball.dy = -ball.speed;
    laserSound.play();
  }
  // Brick collision
  bricks.forEach((column) => {
    column.forEach((brick) => {
      if (brick.visible) {
        if (
          ball.x - ball.size > brick.x && // left brick side check
          ball.x + ball.size < brick.x + brick.w && // right brick side check
          ball.y + ball.size > brick.y && // top brick side check
          ball.y - ball.size < brick.y + brick.h // bottom brick side check
        ) {
          ball.dy *= -1;
          brick.visible = false;
          increaseScore();
          explosionSound.play();
        }
      }
    });
  });
  // Hit bottom wall - Lose, reset bricks, score and level
  if (ball.y + ball.size > canvas.height) {
    showAllBricks();
    score = 0;
    level = 1;
  }
};

// increase score
const increaseScore = () => {
  score++;
  // if there are no bricks - win, reset bricks, increase level and score
  if (score % (brickRowCount * brickColumnCount) === 0) {
    showAllBricks();
    level++;
  }
};

// show all bricks on the canvas
const showAllBricks = () => {
  bricks.forEach((column) => {
    column.forEach((brick) => (brick.visible = true));
  });
};

// draw everything
const draw = () => {
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();
  drawScore();
  drawLevel();
  drawBricks();
};

// update canvas drawing and animation
const update = () => {
  movePaddle();
  moveBall();
  // draw everything
  draw();
  requestAnimationFrame(update);
};

update();

// initialise sound
function sound(src) {
  this.sound = document.createElement('audio');
  this.sound.src = src;
  this.sound.setAttribute('preload', 'auto');
  this.sound.setAttribute('controls', 'none');
  this.sound.style.display = 'none';
  this.sound.volume = 0.2;
  document.body.appendChild(this.sound);
  this.play = function () {
    this.sound.play();
  };
  this.stop = function () {
    this.sound.pause();
  };
}

laserSound = new sound('/soundEffects/laser.mp3');
explosionSound = new sound('/soundEffects/explosion.mp3');

// keydown event
const keyDown = (e) => {
  if (e.keyCode === 68) paddle.dx = paddle.speed;
  if (e.keyCode === 65) paddle.dx = -paddle.speed;
};

// keyup event
const keyUp = (e) => {
  if (e.keyCode === 68 || e.keyCode === 65) paddle.dx = 0;
};

// keyboard event handlers
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// rules and close event handlers
rulesBtn.addEventListener('click', () => rules.classList.add('show'));
closeBtn.addEventListener('click', () => rules.classList.remove('show'));
