<script>
export let startQuiz

import CardLg from "./CardLg.svelte";
import { fade, blur, fly, slide, scale } from "svelte/transition";
import { flip } from 'svelte/animate';


let animate = true;

</script>

<CardLg>
  <main>
  {#if animate}
    <div in:fade={{ delay: 500 }} out:scale class="start-div">
      <h2>Welcome to 'Trivia Time'!</h2>
      <button class="btn" on:click={startQuiz}>START</button>
    </div>
  {/if}
  </main>
</CardLg>
<style>


.start-div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5rem;
}

h2 {
  font-size: 3rem;
}

.btn {
  background: #E0C3FC;
  padding: 20px 26px;
  color: #fff;
  font-size: 1rem;
  border: 2px solid #8EC5FC;
  border-radius: 15px;
  cursor: pointer;
}

.btn:hover {
  background: #8EC5FC;
  border: 2px solid #E0C3FC;

}


</style>