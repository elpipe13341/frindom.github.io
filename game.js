const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajusta el tamaño del canvas a la ventana
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const map = {
    width: canvas.width,
    height: canvas.height
};

const images = {
    player: new Image(),
    gold: new Image(),
    spider: new Image(),
    background: new Image()
};

images.player.src = 'images/dog.png';
images.gold.src = 'images/coin.png';
images.spider.src = 'images/spider.png';
images.background.src = 'images/background.png';

let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    speed: 5,
    health: 100,
    gold: 0
};

function getRandomPosition() {
    return {
        x: Math.random() * (map.width - 20),
        y: Math.random() * (map.height - 20)
    };
}

let items = Array.from({ length: 10 }, () => ({
    type: 'gold',
    x: getRandomPosition().x,
    y: getRandomPosition().y,
    width: 20,
    height: 20
}));

let spiders = Array.from({ length: 15 }, () => ({
    x: getRandomPosition().x,
    y: getRandomPosition().y,
    width: 30,
    height: 30,
    speed: 2,
    dx: Math.random() * 2 - 1,
    dy: Math.random() * 2 - 1
}));

const spiderDetectionRange = 150;

let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Control táctil
let touchControls = {
    left: false,
    right: false,
    up: false,
    down: false
};

// Espera a que las imágenes se carguen
function startGame() {
    let loadedImages = 0;
    const totalImages = Object.keys(images).length;

    function imageLoaded() {
        loadedImages++;
        if (loadedImages === totalImages) {
            console.log("Todas las imágenes se han cargado.");
            update();
        }
    }

    for (const key in images) {
        images[key].onload = imageLoaded;
        images[key].onerror = () => console.error(`Error al cargar la imagen: ${images[key].src}`);
    }
}

function drawPlayer() {
    ctx.drawImage(images.player, player.x, player.y, player.width, player.height);
}

function drawItems() {
    items.forEach(item => {
        ctx.drawImage(images.gold, item.x, item.y, item.width, item.height);
    });
}

function drawSpiders() {
    spiders.forEach(spider => {
        ctx.drawImage(images.spider, spider.x, spider.y, spider.width, spider.height);
    });
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height); // Dibuja el fondo
    movePlayer();
    drawPlayer();
    drawItems();
    drawSpiders();
    handleCollision();
    moveSpiders();
    checkGameStatus();
    requestAnimationFrame(update);
}

function movePlayer() {
    let dx = 0;
    let dy = 0;

    if (keys['ArrowUp'] || touchControls.up) dy -= player.speed;
    if (keys['ArrowDown'] || touchControls.down) dy += player.speed;
    if (keys['ArrowLeft'] || touchControls.left) dx -= player.speed;
    if (keys['ArrowRight'] || touchControls.right) dx += player.speed;

    let length = Math.sqrt(dx * dx + dy * dy);
    if (length > player.speed) {
        dx = (dx / length) * player.speed;
        dy = (dy / length) * player.speed;
    }

    player.x += dx;
    player.y += dy;

    player.x = Math.max(0, Math.min(player.x, map.width - player.width));
    player.y = Math.max(0, Math.min(player.y, map.height - player.height));
}

function handleCollision() {
    items = items.filter(item => {
        if (isColliding(player, item)) {
            if (item.type === 'gold') {
                player.gold += 1;
                Object.assign(item, getRandomPosition());
            }
            return false;
        }
        return true;
    });

    spiders.forEach(spider => {
        if (isColliding(player, spider)) {
            player.health = 0;
        }
    });
}

function moveSpiders() {
    spiders.forEach(spider => {
        const dxToPlayer = player.x - spider.x;
        const dyToPlayer = player.y - spider.y;
        const distanceToPlayer = Math.sqrt(dxToPlayer * dxToPlayer + dyToPlayer * dyToPlayer);

        if (distanceToPlayer < spiderDetectionRange) {
            const angle = Math.atan2(dyToPlayer, dxToPlayer);
            spider.dx = Math.cos(angle);
            spider.dy = Math.sin(angle);
        } else {
            spider.x += spider.dx * spider.speed;
            spider.y += spider.dy * spider.speed;

            if (spider.x <= 0 || spider.x >= map.width - spider.width) spider.dx *= -1;
            if (spider.y <= 0 || spider.y >= map.height - spider.height) spider.dy *= -1;
        }

        spider.x = Math.max(0, Math.min(spider.x, map.width - spider.width));
        spider.y = Math.max(0, Math.min(spider.y, map.height - spider.height));
    });
}

function isColliding(rect1, rect2) {
    return !(rect1.x > rect2.x + rect2.width ||
        rect1.x + rect1.width < rect2.x ||
        rect1.y > rect2.y + rect2.height ||
        rect1.y + rect1.height < rect2.y);
}

function checkGameStatus() {
    document.getElementById('health').textContent = player.health;
    document.getElementById('gold').textContent = player.gold;

    if (player.gold >= 10) {
        alert('¡Ganaste! Has recogido 10 piezas de oro.');
        resetGame();
    }

    if (player.health <= 0) {
        alert('Perdiste. Una araña te ha atrapado.');
        resetGame();
    }
}

function resetGame() {
    player = { x: canvas.width / 2, y: canvas.height / 2, width: 40, height: 40, speed: 5, health: 100, gold: 0 };
    items = Array.from({ length: 10 }, () => ({
        type: 'gold',
        x: getRandomPosition().x,
        y: getRandomPosition().y,
        width: 20,
        height: 20
    }));
    spiders = Array.from({ length: 15 }, () => ({
        x: getRandomPosition().x,
        y: getRandomPosition().y,
        width: 30,
        height: 30,
        speed: 2,
        dx: Math.random() * 2 - 1,
        dy: Math.random() * 2 - 1
    }));
}

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// Control táctil
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleTouch(touch, true);
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleTouch(null, false);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleTouch(touch, true);
}, { passive: false });

function handleTouch(touch, isTouchDown) {
    if (touch) {
        const { clientX: x, clientY: y } = touch;
        const canvasRect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / canvasRect.width;
        const scaleY = canvas.height / canvasRect.height;
        const touchX = (x - canvasRect.left) * scaleX;
        const touchY = (y - canvasRect.top) * scaleY;

        if (touchY < canvas.height / 2) {
            touchControls.up = isTouchDown && touchX > canvas.width / 2;
            touchControls.down = isTouchDown && touchX < canvas.width / 2;
        } else {
            touchControls.left = isTouchDown && touchX < canvas.width / 2;
            touchControls.right = isTouchDown && touchX > canvas.width / 2;
        }
    } else {
        touchControls.left = touchControls.right = touchControls.up = touchControls.down = false;
    }
}

startGame();
