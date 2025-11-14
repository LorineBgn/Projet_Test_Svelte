<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  let firstname = "";

  function login() {
    if (!firstname.trim()) return;
    const color = `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`;
    dispatch("login", { firstname: firstname.trim(), color });
  }
</script>

<div class="login-box">
  <h2>Bienvenue !</h2>
  <p>Entrez votre prénom pour rejoindre le document :</p>

  <input
    bind:value={firstname}
    placeholder="Votre prénom"
    on:keydown={(e) => e.key === "Enter" && login()}
  />

  <button disabled={!firstname.trim()} on:click={login}> Continuer </button>
</div>

<style>
  .login-box {
    max-width: 320px;
    margin: 100px auto;
    padding: 20px;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  input {
    width: 100%;
    padding: 10px 12px;
    margin-top: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
  }

  button {
    width: 100%;
    padding: 10px;
    margin-top: 12px;
    background: #4e7bff;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
  }

  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
</style>
