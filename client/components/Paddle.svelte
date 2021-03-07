<script lang="ts">
  interface Vec2 {
    x: number;
    y: number;
  }
  export let posX: number = 0;
  export let posY: number = 0;
</script>

<rect class="paddle" x={posX} y={posY} width={10} height={120} />

<style>
  .paddle {
    fill: white;
  }
</style>
