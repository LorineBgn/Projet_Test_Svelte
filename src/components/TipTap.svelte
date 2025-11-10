<script>
  import "./tiptap.scss";

  import StarterKit from "@tiptap/starter-kit";
  import { Editor } from "@tiptap/core";
  import { onMount, onDestroy } from "svelte";
  import { supabase } from "../lib/Supabase.js";

  let element;
  let editor;

  // Abonnement realtime
  const channel = supabase.channel("doc1");

  // Écoute les changements venant d'autres utilisateurs
  channel
    .on("broadcast", { event: "update" }, ({ payload }) => {
      if (editor) {
        editor.commands.setContent(payload.content);
      }
    })
    .subscribe();

  onMount(() => {
    editor = new Editor({
      element,
      extensions: [StarterKit],
      content: "",
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        channel.send({
          type: "broadcast",
          event: "update",
          payload: { content: html },
        });
      },
    });
  });

  onDestroy(() => {
    editor?.destroy();
  });
</script>

<!--{#if editor}
  <div class="control-group">
    <div class="button-group">
      <button
        on:click={() =>
          console.log && editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        class={editor.isActive("bold") ? "is-active" : ""}
      >
        Bold
      </button>
      <button
        on:click={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        class={editor.isActive("italic") ? "is-active" : ""}
      >
        Italic
      </button>
      <button
        on:click={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        class={editor.isActive("strike") ? "is-active" : ""}
      >
        Strike
      </button>
      <button
        on:click={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        class={editor.isActive("code") ? "is-active" : ""}
      >
        Code
      </button>
      <button on:click={() => editor.chain().focus().unsetAllMarks().run()}
        >Clear marks</button
      >
      <button on:click={() => editor.chain().focus().clearNodes().run()}
        >Clear nodes</button
      >
      <button
        on:click={() => editor.chain().focus().setParagraph().run()}
        class={editor.isActive("paragraph") ? "is-active" : ""}
      >
        Paragraph
      </button>
      <button
        on:click={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()}
        class={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
      >
        H1
      </button>
      <button
        on:click={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()}
        class={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
      >
        H2
      </button>
      <button
        on:click={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()}
        class={editor.isActive("heading", { level: 3 }) ? "is-active" : ""}
      >
        H3
      </button>
      <button
        on:click={() =>
          editor.chain().focus().toggleHeading({ level: 4 }).run()}
        class={editor.isActive("heading", { level: 4 }) ? "is-active" : ""}
      >
        H4
      </button>
      <button
        on:click={() =>
          editor.chain().focus().toggleHeading({ level: 5 }).run()}
        class={editor.isActive("heading", { level: 5 }) ? "is-active" : ""}
      >
        H5
      </button>
      <button
        on:click={() =>
          editor.chain().focus().toggleHeading({ level: 6 }).run()}
        class={editor.isActive("heading", { level: 6 }) ? "is-active" : ""}
      >
        H6
      </button>
      <button
        on:click={() => editor.chain().focus().toggleBulletList().run()}
        class={editor.isActive("bulletList") ? "is-active" : ""}
      >
        Bullet list
      </button>
      <button
        on:click={() => editor.chain().focus().toggleOrderedList().run()}
        class={editor.isActive("orderedList") ? "is-active" : ""}
      >
        Ordered list
      </button>
      <button
        on:click={() => editor.chain().focus().toggleCodeBlock().run()}
        class={editor.isActive("codeBlock") ? "is-active" : ""}
      >
        Code block
      </button>
      <button
        on:click={() => editor.chain().focus().toggleBlockquote().run()}
        class={editor.isActive("blockquote") ? "is-active" : ""}
      >
        Blockquote
      </button>
      <button on:click={() => editor.chain().focus().setHorizontalRule().run()}>
        Horizontal rule
      </button>
      <button on:click={() => editor.chain().focus().setHardBreak().run()}
        >Hard break</button
      >
      <button
        on:click={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        Undo
      </button>
      <button
        on:click={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        Redo
      </button>
      <button
        on:click={() => editor.chain().focus().setColor("#958DF1").run()}
        class={editor.isActive("textStyle", { color: "#958DF1" })
          ? "is-active"
          : ""}
      >
        Purple
      </button>
    </div>
  </div>
{/if}-->
<div bind:this={element} />
