import './style.css'
import { getRad } from '@/common/helpers/getRad';
import {PlayerPosition} from "@/common/types";
import {getAngleFrom2Points} from "@/common/helpers/getAngleFrom2Points";
import { Vector } from "@/common/helpers/vector";

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
let lastRender = Date.now();

const fieldWidth = 500;
const fieldHeight = 500;
const fieldCoords = {
    x: (canvas.width - fieldWidth) / 2,
    y: (canvas.height - fieldHeight) / 2,
    x2: fieldWidth + (canvas.width - fieldWidth) / 2,
    y2: fieldHeight + (canvas.height - fieldHeight) / 2,
    xc: canvas.width / 2,
    yc: canvas.height / 2,
}

const racketWidth = 50;
const racketHeight = 5;
const playerPosition = {
    x: fieldCoords.xc,
    y: fieldCoords.y2 - racketWidth / 2,
    accelerationVector: new Vector(),
    speedVector: new Vector(),
    anglePrev: 0,
    angle: 0,
};

const pressedKeys = {
    KeyA: false,
    KeyD: false,
    KeyW: false,
    KeyS: false,
}
const playerMaxSpeed = 2;
const playerAcceleration = 0.3;

const ball = {
    x: fieldCoords.xc,
    y: fieldCoords.yc,
    speedVector: new Vector(0, 2),
}
const ballRadius = 5;
const ballFriction = 0.005;
const ballMinSpeed = 2;
const ballMaxSpeed = 5;

document.addEventListener('keydown', (event) => {
    pressedKeys[event.code] = true;
})
document.addEventListener('keyup', (event) => {
    pressedKeys[event.code] = false;
})
window.requestAnimationFrame(draw);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePlayerPosition();
    updateBallPosition();
    drawInterface();
    drawFps();
    drawPlayer();
    drawBall();

    lastRender = Date.now();
    window.requestAnimationFrame(draw);
}

function drawFps() {
    const fps = Date.now() - lastRender;
    ctx.font = "20px serif";
    ctx.fillText(`FPS: ${Math.round(1000 / fps)}`, fieldCoords.x2 + 10, fieldCoords.y + 12);
}

function drawPlayer() {
    ctx.save();
    ctx.translate(playerPosition.x, playerPosition.y);
    ctx.rotate(getRad(playerPosition.angle));
    ctx.fillStyle = "#000";
    ctx.fillRect( - racketWidth/2,  - racketHeight/2, racketWidth, racketHeight)
    ctx.restore();

    // const corners = getPlayerCorners();
    // ctx.beginPath();
    // ctx.arc(corners.x1, corners.y1, 5, 0, getRad(360));
    // ctx.arc(corners.x2, corners.y2, 5, 0, getRad(360));
    // ctx.closePath();
    // ctx.fill();
}

function updatePlayerPosition() {
    const boundaryX = [fieldCoords.x + racketWidth / 2, fieldCoords.x2 - racketWidth / 2];
    const boundaryY = [fieldCoords.yc + racketWidth / 2, fieldCoords.y2 - racketWidth / 2];

    playerPosition.accelerationVector = new Vector();
    if (pressedKeys.KeyA) {
        playerPosition.accelerationVector.add(new Vector(-playerAcceleration, 0))
    } else if (playerPosition.speedVector.x < 0) {
        playerPosition.accelerationVector.add(new Vector(playerAcceleration, 0))
    }
    if (pressedKeys.KeyD) {
        playerPosition.accelerationVector.add(new Vector(playerAcceleration, 0))
    } else if (playerPosition.speedVector.x > 0) {
        playerPosition.accelerationVector.add(new Vector(-playerAcceleration, 0))
    }
    if (pressedKeys.KeyW) {
        playerPosition.accelerationVector.add(new Vector(0, -playerAcceleration))
    } else if (playerPosition.speedVector.y < 0) {
        playerPosition.accelerationVector.add(new Vector(0, playerAcceleration))
    }
    if (pressedKeys.KeyS) {
        playerPosition.accelerationVector.add(new Vector(0, playerAcceleration))
    } else if (playerPosition.speedVector.y > 0) {
        playerPosition.accelerationVector.add(new Vector(0, -playerAcceleration))
    }
    /**
     * Если вектор получился диагональный - его длинна будет больше
     * из-за сложения векторов. Поэтому во всех случаях устанавливаем одну и ту же длинну.
     */
    if (!playerPosition.accelerationVector.isZeroVector()) {
        playerPosition.accelerationVector.setLength(playerAcceleration);
    }

    playerPosition.speedVector.add(playerPosition.accelerationVector);
    if (playerPosition.speedVector.getLength() > playerMaxSpeed) {
        playerPosition.speedVector.setLength(playerMaxSpeed)
    }

    const dx = playerPosition.speedVector.x;
    const dy = playerPosition.speedVector.y;

    if (playerPosition.x + dx > boundaryX[1]) {
        playerPosition.x = boundaryX[1]
    } else if (playerPosition.x + dx < boundaryX[0]) {
        playerPosition.x = boundaryX[0]
    } else {
        playerPosition.x += dx;
    }
    if (playerPosition.y + dy > boundaryY[1]) {
        playerPosition.y = boundaryY[1]
    } else if (playerPosition.y + dy < boundaryY[0]) {
        playerPosition.y = boundaryY[0]
    } else {
        playerPosition.y += dy;
    }
    playerPosition.anglePrev = playerPosition.angle;
    // playerPosition.angle = -getAngleFrom2Points(playerPosition.x, playerPosition.y, mouseCoords.x, mouseCoords.y);
}

function drawInterface() {
    ctx.strokeRect(fieldCoords.x, fieldCoords.y, fieldWidth, fieldHeight);

    ctx.beginPath();
    ctx.moveTo(fieldCoords.x, fieldCoords.yc);
    ctx.lineTo(fieldCoords.x2, fieldCoords.yc);
    ctx.closePath();
    ctx.stroke();
}

function updateBallPosition() {
    ball.speedVector.setLength(ball.speedVector.getLength() - ballFriction);
    if (ball.speedVector.getLength() < ballMinSpeed) {
        ball.speedVector.setLength(ballMinSpeed);
    }
    if (ball.speedVector.getLength() > ballMaxSpeed) {
        ball.speedVector.setLength(ballMaxSpeed);
    }

    const playerAngleDiff = getRad(playerPosition.anglePrev - playerPosition.angle);
    const maxAdditionallySpeed = racketWidth * Math.sin(playerAngleDiff / 2);

    ball.x += ball.speedVector.x;
    ball.y += ball.speedVector.y;

    if (ball.x + ballRadius >= fieldCoords.x2 || ball.x - ballRadius <= fieldCoords.x) {
        ball.speedVector.setAngleDeg(2 * 90 - ball.speedVector.getAngleDeg())
    }
    if (ball.y + ballRadius >= fieldCoords.y2 || ball.y - ballRadius <= fieldCoords.y) {
        ball.speedVector.setAngleDeg(- ball.speedVector.getAngleDeg())
    }

    const corners = getPlayerCorners();
    const ballCollisionVector = ball.speedVector.copy();
    ballCollisionVector.subtract(playerPosition.speedVector);
    if (ballCollisionVector.getLength() < ballRadius) {
        ballCollisionVector.setLength(ballRadius)
    }
    ballCollisionVector.setLength(ballCollisionVector.getLength() + Math.abs(maxAdditionallySpeed * 2));

    ///
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(ball.x + ballCollisionVector.x * 5,  ball.y + ballCollisionVector.y * 5);
    ctx.closePath();
    ctx.stroke();
    ///

    const intersect = getIntersect(corners.x1, corners.y1, corners.x2, corners.y2, ball.x, ball.y, ball.x + ballCollisionVector.x, ball.y + ballCollisionVector.y);
    if (intersect) {
        const shoulderVector = new Vector(intersect.x - playerPosition.x, intersect.y - playerPosition.y);
        const sign = Math.sign(intersect.x - playerPosition.x);
        const shoulderValue = shoulderVector.getLength();
        const additionallySpeed = 2 * shoulderValue * Math.sin(playerAngleDiff / 2) * sign;
        console.log(additionallySpeed);
        ball.speedVector.setAngleDeg(2 * playerPosition.angle - ball.speedVector.getAngleDeg());
        ball.speedVector.add(playerPosition.speedVector);
        ball.speedVector.setLength(ball.speedVector.getLength() + additionallySpeed);
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, getRad(360));
    ctx.closePath();
    ctx.fill();
}


function getPlayerCorners() {
    const cos = Math.cos(getRad(playerPosition.angle));
    const sin = Math.sin(getRad(playerPosition.angle));
    const length = racketWidth / 2;
    return {
        x1: playerPosition.x + length * cos,
        y1: playerPosition.y + length * sin,
        x2: playerPosition.x - length * cos,
        y2: playerPosition.y - length * sin,
    };
}

function getIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
        return false
    }

    const denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

    // Lines are parallel
    if (denominator === 0) {
        return false
    }

    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return false
    }

    // Return a object with the x and y coordinates of the intersection
    const x = x1 + ua * (x2 - x1)
    const y = y1 + ua * (y2 - y1)

    return { x, y }
}
