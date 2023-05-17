
<script>
    import { score } from "./store";
    export let question;
    export let nextQuestion;

    
    let isCorrect;
    let isAnswered = false;

    let answers = question.incorrect_answers.map(answer => {
        return {
            answer,
            correct: false
        }
    });

    let allAnswers = [
        ...answers,
        {
            answer: question.correct_answer,
            correct: true
        }
    ]
    shuffle(allAnswers)

    function shuffle(array) {
        array.sort(() => Math.random() - 0.5)
    }

    function checkQuestion(correct, e) {
        if (!isAnswered) {
            isCorrect = correct
            isAnswered = true
            if (correct) {
                score.update((val) => val + 1 );
                e.target.style.backgroundColor="#80FF72"
            } else {
                e.target.style.backgroundColor="#EC0B43"
            }
        }
        
    }

</script>


<div class="question-component">

    <div class="question-div">
        <h3>{@html question.question}</h3>
    </div>
    
    <div class="answer-div">
        {#each allAnswers as answer}
    
                <button id="answer-btn" class="answer" on:click={(e) => checkQuestion(answer.correct, e)}>
                    {@html answer.answer}
                </button>
        {/each}
    </div> 
    
    {#if isAnswered }

        <div>
            <button class="next-question-btn" on:click={nextQuestion}>Next Question</button>    
        </div>
        
    {/if}

</div>





<style>
    h5 {
        color: blueviolet;
    }

    h5.wrong {
        color: red;
    }

    h5.isCorrect {
        color: green;
    }

    .answer-div {
        display: flex;
        justify-content: space-between;
    }

    .answer {
        background-color: #E0C3FC;
        color: #232323;
        border: 2px solid #8EC5FC;
        border-radius: 15px;
        padding: 1rem 1.5rem;
        gap: 3rem;
        cursor: pointer;
    }

    .answer:hover {
        opacity: .8;
    }

    .next-question-btn {
        margin-top: 2rem;
        background-color: #E0C3FC;
        color: #232323;
        border: 2px solid #8EC5FC;
        border-radius: 15px;
        padding: 1rem 1.5rem;
        cursor: pointer;
    }



</style>