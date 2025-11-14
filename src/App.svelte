<script>
  import Login from "./components/Login.svelte";
  import Editor from "./components/Editor.svelte";

  let user = null;
</script>

{#if !user}
  <Login on:login={(e) => (user = e.detail)} />
{:else}
  <Editor {user} />
{/if}
