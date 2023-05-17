<script>
  import Quiz from "./Quiz.svelte";
  import Header from "./Header.svelte";
  import QuizStart from "./QuizStart.svelte";
  let isQuizStart = false;
  

let startQuiz = () => {
     isQuizStart = true;
}

</script>
<div class="app">

  {#if isQuizStart === false}
    
    <QuizStart {startQuiz} />
  
  {:else if isQuizStart === true}

  <Quiz />

  {/if}

</div>

<style>
	 .app {
    flex-direction: column;
   }

</style>