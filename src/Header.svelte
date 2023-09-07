
<script>

export let resetQuiz

</script>


<main>
    <h1>🎉 Music Trivia 🎉</h1>
    <button class="restart-btn" on:click={resetQuiz}>Start Quiz</button>
</main>

<style>
    
    h1 {
        color: #323232;
    }

    main {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 4rem;


    }
    
    button.restart-btn {
        border: 2px solid #8EC5FC;
        background: #E0C3FC;
        color: #323232;
        font-size: 1rem;
        border-radius: 15px;
        padding: .5rem 2rem;
        cursor: pointer;
    }

    button.restart-btn:hover {
        opacity: .9;
        background: #8EC5FC;
        border: 2px solid #E0C3FC;
    }

</style>

