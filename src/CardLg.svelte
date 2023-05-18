
<div class="card">
    <slot></slot>
</div>

<style>

  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.2);
    padding: 20px;
    border-radius: 6px;
    box-shadow: 0px 2px 4px rgba(0,0,0,0.8);
    min-width: 80vw;
    min-height: 80vh;
    margin-top: 1rem;
  }

</style>