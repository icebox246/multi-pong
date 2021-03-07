<script lang="ts">
  export let serverURL: string = '';

  import GameArea from './components/GameArea.svelte';
  import { tweened } from 'svelte/motion';
  import { linear } from 'svelte/easing';
  let moveDirection: number = 0;
  let myScore: number = 0;
  let otherScore: number = 0;

  const tweenOptions = {
    duration: 1000 / 20,
    easing: linear,
  };

  let myPaddleY = tweened(180, tweenOptions);
  let otherPaddleY = tweened(180, tweenOptions);
  let ballX = tweened(320, tweenOptions);
  let ballY = tweened(240, tweenOptions);

  const socket = new WebSocket(serverURL);
  let socketInterval = undefined;
  let playerUUID = undefined;
  let connected = false;
  let closeError = '';

  socket.onopen = (e) => {
    console.log('connection established');
    connected = true;
  };

  socket.onclose = (e) => {
    connected = false;
    closeError = e.reason;
  };

  socket.onmessage = (e) => {
    closeError = '';
    const message = JSON.parse(e.data);
    if (message.firstUUID) {
      playerUUID = message.firstUUID;
    } else if (message.positionUpdate) {
      message.players.forEach((p) => {
        if (p.uuid === playerUUID) {
          myPaddleY.set(p.position);
          otherScore = p.misses;
        } else {
          otherPaddleY.set(p.position);
          myScore = p.misses;
        }
      });

      ballX.set(message.ball.x);
      ballY.set(message.ball.y);

      moveDirection = 0 + (upPressed ? -1 : 0) + (downPressed ? 1 : 0);

      socket.send(
        JSON.stringify({
          direction: moveDirection,
          uuid: playerUUID,
        })
      );
    }
  };

  let upPressed = false;
  let downPressed = false;

  function handleKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        upPressed = true;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        downPressed = true;
        break;
    }
  }
  function handleKeyUp(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        upPressed = false;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        downPressed = false;
        break;
    }
  }
</script>

<svelte:window on:keyup={handleKeyUp} on:keydown={handleKeyDown} />

<main>
  <h1>Pong</h1>
  <GameArea
    myPaddleY={$myPaddleY}
    otherPaddleY={$otherPaddleY}
    ballX={$ballX}
    ballY={$ballY}
    {myScore}
    {otherScore}
  />
  <h3 class="status" class:connected>CONNECTED</h3>
  <p>{closeError}</p>
  <p>Your paddle is always on the left</p>
</main>

<style>
  .connected {
    color: rgb(58, 163, 58);
    border-bottom: 2px green solid;
  }
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  :global(body) {
    color: white;
    font-family: 'Courier New', Courier, monospace;
    background: radial-gradient(
      circle 2500px at -10% -10%,
      rgba(30, 39, 107, 1) 6.1%,
      rgba(188, 104, 142, 1) 100.2%
    );
  }
</style>
