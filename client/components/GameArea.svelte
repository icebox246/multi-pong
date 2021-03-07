<script lang="ts">
  import Paddle from './Paddle.svelte';
  import Ball from './Ball.svelte';
  export let myPaddleY: number = 10;
  export let otherPaddleY: number = 30;
  export let ballX: number;
  export let ballY: number;
  export let myScore: number;
  export let otherScore: number;
</script>

<div class="root">
  <div class="line" />
  <svg class="area">
    <Paddle posX={20} posY={myPaddleY} />
    <Paddle posX={610} posY={otherPaddleY} />
    <Ball x={ballX} y={ballY} />
  </svg>
  <div class="score">
    <p class="my">{myScore}</p>
    <p>-</p>
    <p class="other">{otherScore}</p>
  </div>
</div>

<style>
  .area {
    background-color: black;
    width: 640px;
    height: 480px;
    position: relative;
    fill: white;
  }
  .line {
    height: 100%;
    position: absolute;
    margin-left: calc(50% - 1px);
    border: 1px dashed white;
    background-color: black;
    z-index: 3;
    content: ' ';
  }
  .score {
    color: white;
    position: absolute;
    top: 30px;
    width: 100%;
    font-size: 40px;
    font-family: 'Courier New', Courier, monospace;
    display: flex;
  }
  .score .my {
    flex: 1;
    text-align: right;
  }
  .score .other {
    flex: 1;
    text-align: left;
  }
  .root {
    position: relative;
  }
</style>
