document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const gravity = 0.6;
  const jumpStrength = 15;
  const groundY = canvas.height - 50;

  const enemies = [];
  const defeatedEffects = [];
  let gameCleared = false;

  const player = {
    x: 50,
    y: groundY,
    width: 30,
    height: 30,
    speed: 5,
    dx: 0,
    dy: 0,
    isJumping: false
  };

  function createEnemy(x, y) {
    enemies.push({
        x: x,
        y: y,
        width: 30,
        height: 30,
        speed: 2,
        dx: -2,
        alive: true
    });
  }

  function drawPlayer() {
    ctx.font = '30px Arial';
    ctx.fillText('😊', player.x, player.y);
  }

  function drawEnemies() {
    ctx.font = '30px Arial';
    enemies.forEach(enemy => {
        if (enemy.alive) {
            ctx.fillText('👽', enemy.x, enemy.y);
        }
    });
  }

  function drawEffects() {
    ctx.font = '30px Arial';
    defeatedEffects.forEach(effect => {
        ctx.fillText('👍', effect.x, effect.y);
    });
  }

  function drawClearMessage() {
    ctx.font = '60px Arial';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.fillText('クリア!', canvas.width / 2, canvas.height / 2);
    ctx.textAlign = 'left';
  }

  function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function updateEnemies() {
    enemies.forEach(enemy => {
        if (!enemy.alive) return;

        enemy.x += enemy.dx;

        if (enemy.x < 0 || enemy.x + enemy.width > canvas.width) {
            enemy.dx *= -1;
        }
    });
  }

  function checkCollisions() {
    if (gameCleared) return;

    enemies.forEach((enemy) => {
        if (!enemy.alive) return;

        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            const isStomp = player.dy > 0 && (player.y + player.height) < (enemy.y + 20);

            if (isStomp) {
                enemy.alive = false;
                player.dy = -jumpStrength / 2;
                player.isJumping = true;

                defeatedEffects.push({
                    x: enemy.x,
                    y: enemy.y,
                    createdAt: Date.now()
                });

                if (enemies.every(e => !e.alive)) {
                    gameCleared = true;
                }

            } else {
                player.x = 50;
                player.y = groundY;
                player.dx = 0;
                player.dy = 0;
                player.isJumping = false;
            }
        }
    });

    const now = Date.now();
    for (let i = defeatedEffects.length - 1; i >= 0; i--) {
        if (now - defeatedEffects[i].createdAt > 1000) {
            defeatedEffects.splice(i, 1);
        }
    }
  }

  function newPos() {
    player.x += player.dx;

    // Apply gravity
    player.dy += gravity;
    player.y += player.dy;

    // wall detection
    if (player.x < 0) {
      player.x = 0;
    }

    if (player.x + player.width > canvas.width) {
      player.x = canvas.width - player.width;
    }

    // ground detection
    if (player.y > groundY) {
        player.y = groundY;
        player.dy = 0;
        player.isJumping = false;
    }
  }

  function update() {
    clear();
    
    drawPlayer();
    drawEnemies();
    drawEffects();

    if (!gameCleared) {
        newPos();
        updateEnemies();
        checkCollisions();
    } else {
        drawClearMessage();
    }

    requestAnimationFrame(update);
  }

  function moveRight() {
    player.dx = player.speed;
  }

  function moveLeft() {
    player.dx = -player.speed;
  }

  function jump() {
    if (!player.isJumping) {
      player.isJumping = true;
      player.dy = -jumpStrength;
    }
  }

  function stopMove() {
    player.dx = 0;
  }

  function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
      moveRight();
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
      moveLeft();
    } else if (e.key === ' ' || e.key === 'ArrowUp') {
      jump();
    }
  }
  
  function keyUp(e) {
      if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'ArrowLeft' || e.key === 'Left') {
          stopMove();
      }
  }

  document.addEventListener('keydown', keyDown);
  document.addEventListener('keyup', keyUp);

  createEnemy(canvas.width - 100, groundY);
  createEnemy(canvas.width - 250, groundY);
  update();
}); 