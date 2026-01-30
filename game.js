const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// ===== СОСТОЯНИЯ =====
const MENU = "menu";
const SETTINGS = "settings";
const GAME = "game";
const GAME_OVER = "game_over";
let state = MENU;

// ===== ЗАГРУЗКА ИЗОБРАЖЕНИЙ =====
const playerImg = new Image();
playerImg.src = "player.png";

const enemyImg = new Image();
enemyImg.src = "enemy.png";

// ===== ЗВУКИ =====
const musicList = ["music1.mp3", "music2.mp3", "music3.mp3"];
let musicIndex = 0;

const music = new Audio(musicList[musicIndex]);
music.loop = true;
music.volume = 0.3;
music.play();

const laserSound = new Audio("laser.wav");
const gameoverSound = new Audio("gameover.wav");
const recordSound = new Audio("record.wav");

let sfxVolume = 0.5;
laserSound.volume = sfxVolume;
gameoverSound.volume = sfxVolume;
recordSound.volume = sfxVolume;

// ===== РЕКОРД =====
let highScore = Number(localStorage.getItem("record") || 0);

// ===== ИГРОК =====
let player = { x: WIDTH / 2 - 20, y: HEIGHT - 60, speed: 5 };

// ===== ОБЪЕКТЫ =====
let bullets = [];
let enemies = [];
let score = 0;
let lastShot = 0;

// ===== ЗВЁЗДЫ =====
let stars = Array.from({ length: 100 }, () => ({
  x: Math.random() * WIDTH,
  y: Math.random() * HEIGHT,
  s: Math.random() * 2 + 1
}));

// ===== УПРАВЛЕНИЕ =====
let left = false;
let right = false;
let shoot = false;

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") left = true;
  if (e.key === "ArrowRight") right = true;
  if (e.key === " ") shoot = true;
  if (e.key === "Escape") state = MENU;
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") left = false;
  if (e.key === "ArrowRight") right = false;
  if (e.key === " ") shoot = false;
});

// ===== ТАЧ (МОБИЛА) =====
canvas.addEventListener("touchstart", e => {
  const x = e.touches[0].clientX;
  if (x < window.innerWidth / 2) left = true;
  else right = true;
  shoot = true;
});

canvas.addEventListener("touchend", () => {
  left = right = shoot = false;
});

// ===== ФУНКЦИИ =====
function drawStars() {
  ctx.fillStyle = "white";
  stars.forEach(s => {
    s.y += s.s;
    if (s.y > HEIGHT) s.y = 0;
    ctx.fillRect(s.x, s.y, s.s, s.s);
  });
}

function resetGame() {
  bullets = [];
  enemies = [];
  score = 0;
  player.x = WIDTH / 2 - 20;
  state = GAME;
}

// ===== ОСНОВНОЙ ЦИКЛ =====
function loop(time) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawStars();

  if (state === MENU) {
    ctx.fillStyle = "white";
    ctx.font = "32px Arial";
    ctx.fillText("SPACE SHOOTER", 60, 200);
    ctx.font = "20px Arial";
    ctx.fillText("Tap / Space — Start", 90, 300);
    if (shoot) resetGame();
  }

  if (state === GAME) {
    if (left) player.x -= player.speed;
    if (right) player.x += player.speed;

    if (shoot && time - lastShot > 250) {
      bullets.push({ x: player.x + 18, y: player.y });
      laserSound.currentTime = 0;
      laserSound.play();
      lastShot = time;
    }

    bullets.forEach(b => (b.y -= 8));
    bullets = bullets.filter(b => b.y > 0);

    if (Math.random() < 0.03 && enemies.length < 4) {
      enemies.push({ x: Math.random() * (WIDTH - 48), y: -40 });
    }

    enemies.forEach(e => (e.y += 3));

    enemies.forEach(e => {
      if (e.y > HEIGHT) {
        gameoverSound.play();
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("record", highScore);
          recordSound.play();
        }
        state = GAME_OVER;
      }
    });

    bullets.forEach(b => {
      enemies.forEach(e => {
        if (
          b.x > e.x && b.x < e.x + 48 &&
          b.y > e.y && b.y < e.y + 32
        ) {
          score++;
          e.y = 10000;
          b.y = -100;
        }
      });
    });

    enemies = enemies.filter(e => e.y < HEIGHT + 50);

    ctx.drawImage(playerImg, player.x, player.y, 40, 40);
    enemies.forEach(e => ctx.drawImage(enemyImg, e.x, e.y, 48, 32));

    ctx.fillStyle = "yellow";
    bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));

    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 10, 20);
    ctx.fillText("Record: " + highScore, 10, 40);
  }

  if (state === GAME_OVER) {
    ctx.fillStyle = "red";
    ctx.font = "32px Arial";
    ctx.fillText("GAME OVER", 90, 300);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Tap / Space — Menu", 80, 350);
    if (shoot) state = MENU;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
