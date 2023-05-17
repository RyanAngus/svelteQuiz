<script>
    import { fade, blur, fly, slide, scale } from "svelte/transition";
    import { onMount, beforeUpdate, afterUpdate, onDestroy } from 'svelte';
    import Question from "./Question.svelte";
    // import Modal from "./Modal.svelte";
    import { score } from "./store.js";
    import Header from "./Header.svelte";
    import Card from "./Card.svelte";
    import CardLg from "./CardLg.svelte";

    let activeQuestion = 0;
    let quiz = getQuiz();
    let isModalOpen = false;
    let numberOfQuestions = 2



async function getQuiz() {
    const res = await fetch(`https://opentdb.com/api.php?amount=${numberOfQuestions}&category=12&type=multiple&difficulty=medium`);
    const quiz = await res.json()
    return quiz
}


function nextQuestion() {
    activeQuestion = activeQuestion + 1;

}

function resetQuiz() {
    isModalOpen = false;
    score.set(0);
    quiz = getQuiz();
    activeQuestion = 0;
}

function addToScore() {
    $score = score + 1;
}

//   $: if ($score > 7) {
//     isModalOpen = true;
//   }

  $: questionNumber = activeQuestion + 1



</script>

<main in:fade={{ delay: 500 }} out:fade>
    <Header {resetQuiz} />

    <CardLg>
        <div class="quiz">

            <!-- <h3>My Score: {$score} / {numberOfQuestions}</h3> -->

            <div class="container">
            {#await quiz}
                <!-- promise is pending -->
                
            {:then data}
                <!-- promise was fulfilled -->

            {#each data.results as question, index }

                {#if index === activeQuestion}

                    <Card>
                        <div in:fade={{y: 200, duration: 300, delay: 300}} >
                            <h4>Question #{questionNumber}</h4>
                            <Question {nextQuestion} {question} />
                        </div>
                    </Card>

                {/if}

            {/each}

                {#if activeQuestion === numberOfQuestions}

                <Card>
                    <div>
                        <h3>Game over.</h3>
                        <h2>Congratulations! You scored {$score} out of {numberOfQuestions} points.</h2> 
                            
                        <h4>Click the 'Start Quiz' button to play again!</h4>
                    </div>
                </Card>
                    
                {/if}

            {/await}
            
            </div>

            <!-- {#if isModalOpen}
                <Modal on:close={resetQuiz}> 
                    <h2>You won!</h2>
                    <p>Congratulations</p>
                    <button on:click={resetQuiz}>Start Over</button>
                </Modal>  
            {/if} -->

        </div>
    </CardLg>
</main>

<style>

    .quiz {
        display: flex;
        flex-direction: column;
    }

</style>