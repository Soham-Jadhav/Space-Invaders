const canvas = document.querySelector('canvas');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('hscore');
const startGameButton = document.getElementById('startGameButton');
const displayScores = document.getElementById('displayScores');
const displayTextElem = document.getElementById('displayText');
const context = canvas.getContext('2d');

// 16 / 9
canvas.width = 1024;
canvas.height = 576;

context.fillStyle = 'black';
context.fillRect(0, 0, canvas.width, canvas.height);

class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        }
        this.rotation = 0;
        this.opacity = 1;

        const image = new Image();
        image.src = './assets/spaceship.png';

        // runs when the image is loaded completely
        image.onload = () => {
            const scale = 0.15;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;

            this.position = {
                x: canvas.width / 2 - (this.width / 2),
                y: canvas.height - this.height - 20
            };
        }

    }

    draw() {
        // context.fillStyle = 'red';
        // context.fillRect(this.position.x, this.position.y, this.width, this.height);

        // rotate the player
        context.save();
        context.globalAlpha = this.opacity;
        context.translate(player.position.x + player.width / 2, player.position.y + player.height / 2);
        context.rotate(this.rotation);
        context.translate(-player.position.x - player.width / 2, -player.position.y - player.height / 2);

        if (this.image) {
            context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }

        context.restore();
    }

    update() {
        if (this.image) {
            this.draw();
            this.position.x += this.velocity.x;
        }
    }

};

class Projectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;

        this.radius = 4;
    }

    draw() {
        context.beginPath();
        context.fillStyle = 'red';
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        context.fill();
        context.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
};

class Particle {
    constructor({ position, velocity, radius, color, fades }) {
        this.position = position;
        this.velocity = velocity;

        this.radius = radius;
        this.color = color;
        this.opacity = 1;
        this.fades = fades;
    }

    draw() {
        context.save();
        context.globalAlpha = this.opacity;
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        context.fill();
        context.closePath();
        context.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        if (this.fades) this.opacity -= 0.01;
    }
};

class InvaderProjectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;

        // this.radius = 4;
        this.width = 3;
        this.height = 10;
    }

    draw() {
        context.fillStyle = 'white';
        context.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
};

class Invader {
    constructor({ position }) {
        this.velocity = {
            x: 0,
            y: 0
        }

        const image = new Image();
        image.src = './assets/invader.png';

        // runs when the image is loaded completely
        image.onload = () => {
            const scale = 1;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;

            this.position = {
                x: position.x,
                y: position.y
            };
        }

    }

    draw() {
        // rotate the player
        // context.save();
        // context.translate(player.position.x + player.width / 2, player.position.y + player.height / 2);
        // context.rotate(this.rotation);
        // context.translate(-player.position.x - player.width / 2, -player.position.y - player.height / 2);

        if (this.image) {
            context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }

        // context.restore();
    }

    update({ velocity }) {
        if (this.image) {
            this.draw();
            this.position.x += velocity.x;
            this.position.y += velocity.y;
        }
    }

    shoot(invaderProjectiles) {
        invaderProjectiles.push(new InvaderProjectile({
            position: { x: this.position.x + this.width / 2, y: this.position.y + this.height },
            velocity: { x: 0, y: 5 }
        }));
    }

};

class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        };

        this.velocity = {
            x: 3,
            y: 0
        };

        this.invaders = [];

        const rows = 2 + Math.floor(Math.random() * 5);
        const cols = 5 + Math.floor(Math.random() * 10);
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                this.invaders.push(new Invader({
                    position: { x: x * 30, y: y * 30 }
                }))
            }
        }

        this.width = cols * 30;
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.velocity.y = 0;
        if (this.position.x + this.width > canvas.width) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = 30;
        }
        else if (this.position.x < 0) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = 30;
        }
    }
};

let player = new Player();
// player.draw();

// const projectiles = [
//     new Projectile({position: {x: 300, y: 300}, velocity: {x: 0, y: 0}})
// ];
let projectiles = [];
// const invaders = [];
// const invader = new Invader();

let grids = [];

let invaderProjectiles = [];

let particles = [];

let keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    space: {
        pressed: false
    },
};

let score = 0;
let frames = 0;
let randomInterval = Math.floor(Math.random() * 500) + 500;
let game = {
    over: false,
    active: true
};

for (let i = 0; i < 100; i++) {
    particles.push(new Particle({
        position: { x: Math.random() * canvas.width, y: Math.random() * canvas.height },
        velocity: { x: 0, y: 0.3 },
        radius: 1 + Math.random() * 1.7,
        color: 'white'
    }))
}

function init() {
    player = new Player();
    // player.draw();

    // const projectiles = [
    //     new Projectile({position: {x: 300, y: 300}, velocity: {x: 0, y: 0}})
    // ];
    projectiles = [];
    // const invaders = [];
    // const invader = new Invader();

    grids = [];

    invaderProjectiles = [];

    particles = [];

    keys = {
        a: {
            pressed: false
        },
        d: {
            pressed: false
        },
        space: {
            pressed: false
        },
    };

    score = 0;
    frames = 0;
    randomInterval = Math.floor(Math.random() * 500) + 500;
    game = {
        over: false,
        active: true
    };

    for (let i = 0; i < 100; i++) {
        particles.push(new Particle({
            position: { x: Math.random() * canvas.width, y: Math.random() * canvas.height },
            velocity: { x: 0, y: 0.3 },
            radius: 1 + Math.random() * 1.7,
            color: 'white'
        }))
    }

    scoreElement.innerHTML = 0;
}

function createParticles({ object, color, fades }) {
    const scaleParticle = 2;
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle({
            position: { x: object.position.x + object.width / 2, y: object.position.y + object.height / 2 },
            velocity: { x: scaleParticle * (Math.random() - 0.5), y: scaleParticle * (Math.random() - 0.5) },
            radius: Math.random() * 3,
            color: color || '#BBA0DE',
            fades: fades
        }))
    }
}

let animationId;

function animate() {
    if (!game.active) {
        cancelAnimationFrame(animationId);
        displayTextElem.style.display = 'flex';
        return;
    }

    animationId = requestAnimationFrame(animate);
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    // invader.update();
    // player.draw();
    player.update();

    particles.forEach((particle, index) => {
        if (
            particle.position.y - particle.radius >= canvas.height
            && !particle.fades
        ) {
            particle.position.x = Math.random() * canvas.width;
            particle.position.y = 0 - particle.radius;
        }

        if (particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(index, 1);
            }, 0);
        }
        else {
            particle.update();
        }
    })

    invaderProjectiles.forEach((invaderProjectile, index) => {
        if (invaderProjectile.position.y + invaderProjectile.height > canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1);
            }, 0);
        }
        else {
            invaderProjectile.update();
        }

        if (
            invaderProjectile.position.y + invaderProjectile.height >= player.position.y
            && invaderProjectile.position.y <= player.position.y + player.height
            && invaderProjectile.position.x + invaderProjectile.width >= player.position.x
            && invaderProjectile.position.x <= player.position.x + player.width
        ) {
            createParticles({
                object: player,
                color: 'white',
                fades: true
            });

            console.log("Well Played! \nScore: ", score, ", High score: ", highScoreElement.innerHTML);

            setTimeout(() => {
                invaderProjectiles.splice(index, 1);
                player.opacity = 0;
                game.over = true;
            }, 0);

            setTimeout(() => {
                game.active = false;
            }, 2000);

        }
    });

    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }
        else {
            projectile.update();
        }
    });

    grids.forEach((grid, gridIndex) => {
        grid.update();

        if (frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
        }

        grid.invaders.forEach((invader, invaderIndex) => {
            invader.update({ velocity: grid.velocity });

            projectiles.forEach((projectile, projectileIndex) => {
                if (
                    projectile.position.y - projectile.radius <= invader.position.y + invader.height
                    && projectile.position.y + projectile.radius >= invader.position.y
                    && projectile.position.x + projectile.radius >= invader.position.x
                    && projectile.position.x - projectile.radius <= invader.position.x + invader.width
                ) {
                    setTimeout(() => {
                        const invaderFound = grid.invaders.find((invader2) => {
                            return invader2 === invader;
                        });
                        const projectileFound = projectiles.find((projectile2) => {
                            return projectile2 === projectile;
                        });

                        // Remove projectile & invader
                        if (invaderFound && projectileFound) {
                            score += 100;
                            scoreElement.innerHTML = score
                            highScoreElement.innerHTML = Math.max(highScoreElement.innerHTML, score);

                            createParticles({
                                object: invader,
                                color: '#BBA0DE',
                                fades: true
                            });

                            grid.invaders.splice(invaderIndex, 1);
                            projectiles.splice(projectileIndex, 1);

                            if (grid.invaders.length > 0) {
                                const firstInvader = grid.invaders[0];
                                const lastInvader = grid.invaders[grid.invaders.length - 1];

                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                                grid.position.x = firstInvader.position.x;
                            }
                            else {
                                grids.splice(gridIndex, 1);
                            }
                        }
                    }, 0);
                }
            })
        });
    })

    if (keys.a.pressed && player.position.x > 0) {
        player.velocity.x = -7;
        player.rotation = -0.15;
    }
    else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
        player.velocity.x = 7;
        player.rotation = 0.15;
    }
    else {
        player.velocity.x = 0;
        player.rotation = 0;
    }

    if (frames % randomInterval === 0) {
        grids.push(new Grid());
        randomInterval = Math.floor(Math.random() * 500) + 500;
        frames = 0;
    }

    frames++;
}

// animate();

addEventListener('keydown', ({ key }) => {
    // console.log(event.key);
    if (game.over) return;

    switch (key) {
        case 'a':
            console.log('left');
            // player.velocity.x = -5;
            keys.a.pressed = true;
            break;
        case 'd':
            console.log('right');
            // player.velocity.x = 5;
            keys.d.pressed = true;
            break;
        case 'w':
            console.log('up');
            break;
        case 's':
            console.log('down');
            break;
        case ' ':
            console.log('shoot');
            projectiles.push(new Projectile({ position: { x: player.position.x + player.width / 2, y: player.position.y }, velocity: { x: 0, y: -10 } }));
            // console.log(projectiles);
            break;
    }
});

addEventListener('keyup', ({ key }) => {
    // console.log(event.key);
    switch (key) {
        case 'a':
            console.log('left');
            keys.a.pressed = false;
            break;
        case 'd':
            console.log('right');
            keys.d.pressed = false;
            break;
        case 'w':
            console.log('up');
            break;
        case 's':
            console.log('down');
            break;
        case ' ':
            console.log('shoot');
            break;
    }
});

startGameButton.addEventListener('click', (event) => {
    init();
    animate();
    displayScores.style.display = 'flex';
    startGameButton.innerHTML = "Restart";
    displayTextElem.style.display = 'none';
});