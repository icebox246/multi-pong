const WebSocket = require('ws')
const {
  v4: uuid4
} = require('uuid')
const dotenv = require('dotenv')
dotenv.config();

const server = new WebSocket.Server({
  port: process.env.PORT
})

const originalBall = {
  x: 320,
  y: 240,
  vx: -3,
  vy: 5
}
let ball = { ...originalBall }

let gameRunning = false;

const playerPosX = [
  10,
  610,
]

const posTaken =  [
  false,
    false
]


let players = [];
server.on('connection', socket => {
  if (players.length >= 2) {
    socket.send(JSON.stringify({
      message: "To many players!"
    }))
    socket.close(1000,"Game is full");
    return;
  }
  const newPlayerUUID = uuid4();
  let newPosX = 0;
  for (let i = 0; i < 2; i++){
    if (posTaken[i] === false) {
      newPosX = i;
      posTaken[i] = true;
      break;
    }
  }
  players.push({
    socket,
    uuid: newPlayerUUID,
    position: 180,
    direction: 0,
    posX: newPosX,
    misses: 0
  });


  socket.send(JSON.stringify({
    firstUUID: newPlayerUUID
  }))
  socket.on('message', msg => {
    // console.log("Got a message: ", msg)
    data = JSON.parse(msg);
    if (data) {
      if (data.direction != undefined) {
        players = players.map(p => {
          if (p.uuid !== data.uuid) return p;
          const newP = p;
          newP.direction = data.direction;
          return newP;
        })
      }
    }
  })
  socket.on('close', () => {
    players = players.filter(p => {
      if (p.socket !== socket) {
        return true;
      } else {
        posTaken[p.posX] = false;
        return false;
      }
    });
  })
})

const MOVE_SPEED = 15;
const ORIGINAL_BALL_SPEED = 8;
let BALL_SPEED = ORIGINAL_BALL_SPEED;

function constrain(a, min, max) {
  return Math.min(Math.max(a, min), max);
}

let gameGotReset = false;

function resetGame() {
  BALL_SPEED = ORIGINAL_BALL_SPEED;
  ball = { ...originalBall };
}

setInterval(() => {
  if (players.length === 0) {
    if (!gameGotReset) {
      resetGame();
    }
    return;
  }
  if (players.length === 2) {
    gameRunning = true;
  } else {
    gameRunning = false;
  }

  if (gameRunning) {
    let newBall = ball;
    newBall.x += ball.vx;
    newBall.y += ball.vy;
    if (newBall.y < 10 || newBall.y > 470) {
      newBall.vy *= -1;
    }
    newBall.y = constrain(newBall.y, 10, 470);
    if (newBall.x < 40 || newBall.x > 600) {
      players.forEach(p => {          
        if (Math.abs(playerPosX[p.posX] - newBall.x) < 20 &&
          (newBall.y >= p.position && newBall.y <= p.position + 120)) {
          newBall.x = constrain(newBall.x, 40, 600);
          let angle = ((newBall.y - p.position) / 120 - 0.5) * Math.PI * 0.6;
          if (newBall.x > 320) angle += Math.PI;
          newBall.vx = Math.cos(angle) * BALL_SPEED;
          newBall.vy = Math.sin(angle) * BALL_SPEED;
          BALL_SPEED++;
          if (newBall.x > 320)
            newBall.vy *= -1;
        }
      })      
    }

    if (newBall.x < -10 || newBall.x > 650) {
      players.forEach(p => {
        p.position = 180;
        if (Math.abs(playerPosX[p.posX] - newBall.x) < 80) {
          p.misses++;
        }
      })
      newBall = { ...originalBall };
      BALL_SPEED = ORIGINAL_BALL_SPEED;
    }

    ball = newBall;

    players = players.map(p => {
      newP = p;
      newP.position += p.direction * MOVE_SPEED;
      newP.position = constrain(newP.position, 0, 480 - 120);
      return newP;
    })

    const payload = {
      positionUpdate: true,
      players: players.map(pl => {
        return {
          position: pl.position,
          uuid: pl.uuid,
          misses: pl.misses
        };
      }),
      ball : ball
    }

    players.forEach(p => {
      let myPayload = payload;

      if (p.posX === 1) {
        let newBall = { ...myPayload.ball };
        newBall.x = 320 - (newBall.x -320)
        myPayload.ball = newBall;
      }
      p.socket.send(JSON.stringify(myPayload))
    })
  }
}, 1000 / 20)