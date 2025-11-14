<script>
  import "./tiptap.scss";

  import { onMount } from "svelte";
  import { Editor } from "@tiptap/core";
  import { EditorContent } from "svelte-tiptap";
  import StarterKit from "@tiptap/starter-kit";
  import Collaboration from "@tiptap/extension-collaboration";
  import Placeholder from "@tiptap/extension-placeholder";
  import TextStyle from "@tiptap/extension-text-style";
  import Color from "@tiptap/extension-color";
  import TextAlign from "@tiptap/extension-text-align";
  import Underline from "@tiptap/extension-underline";

  import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Undo,
    Redo,
  } from "lucide-svelte";

  import * as Y from "yjs";
  import { supabase } from "../lib/Supabase.js";
  import { writable } from "svelte/store";

  export let user;

  let editor;
  let provider;
  const ydoc = new Y.Doc();

  const editorState = writable(null);

  // Stocke les cursors des autres utilisateurs
  const remoteCursors = writable({});

  function createProvider(supabase, roomName, ydoc) {
    // Abonnement realtime
    const channel = supabase.channel(roomName);

    // Réception d'un update du canal + Application à la page
    channel.on("broadcast", { event: "update" }, ({ payload }) => {
      const update = new Uint8Array(payload.update);
      Y.applyUpdate(ydoc, update);
    });

    // Le doc change localement + Broadcast l'update
    ydoc.on("update", (update) => {
      channel.send({
        type: "broadcast",
        event: "update",
        payload: { update: Array.from(update) },
      });
    });

    // Abonnement Realtime
    channel.subscribe();

    return { channel };
  }

  onMount(() => {
    // Connexion à Realtime
    provider = createProvider(supabase, "doc", ydoc);
    const channel = provider.channel;

    // Instanciation de l'éditeur (TipTap + Yjs)
    editor = new Editor({
      extensions: [
        StarterKit,
        TextStyle,
        Color,
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Collaboration.configure({
          document: ydoc,
        }),
        Placeholder.configure({
          placeholder: "Commencez la saisie ici..",
        }),
      ],
      content: "",
      onTransaction: ({ editor }) => {
        editorState.set(editor);
      },
    });

    // Envoi de la sélection locale
    editor.on("selectionUpdate", () => {
      const state = editor.state.selection;
      channel.send({
        type: "broadcast",
        event: "cursor",
        payload: {
          clientId: user.firstname,
          color: user.color,
          anchor: state.anchor,
          head: state.head,
        },
      });
    });

    // Réception des cursors des autres utilisateurs
    channel.on("broadcast", { event: "cursor" }, ({ payload }) => {
      const { clientId, color, head } = payload;
      if (clientId === user.firstname) return;

      remoteCursors.update((cursors) => ({
        ...cursors,
        [clientId]: { color, head },
      }));
    });

    return () => {
      editor?.destroy();
      channel?.unsubscribe();
    };
  });

  // Retourne la position du curseur dans l’éditeur
  function getCursorCoords(pos) {
    if (!editor || pos == null) return { left: 0, top: 0 };

    const clampedPos = Math.min(
      Math.max(pos, 0),
      editor.state.doc.content.size
    );

    const coords = editor.view.coordsAtPos(clampedPos);
    return coords
      ? { left: coords.left, top: coords.top }
      : { left: 0, top: 0 };
  }
</script>

{#if editor}
  <div class="editor-container">
    <div class="toolbar">
      <!-- Gras -->
      <button
        on:click={() => editor.chain().focus().toggleBold().run()}
        class:active={$editorState?.isActive("bold")}
      >
        <Bold size="18" />
      </button>

      <!-- Italique -->
      <button
        on:click={() => editor.chain().focus().toggleItalic().run()}
        class:active={$editorState?.isActive("italic")}
      >
        <Italic size="18" />
      </button>

      <!-- Souligné -->
      <button
        on:click={() => editor.chain().focus().toggleUnderline().run()}
        class:active={$editorState?.isActive("underline")}
      >
        <UnderlineIcon size="18" />
      </button>

      <div class="separator" />

      <!-- Titres -->
      <select
        on:change={(e) => {
          const lvl = Number(e.target.value);
          lvl === 0
            ? editor.chain().focus().setParagraph().run()
            : editor.chain().focus().toggleHeading({ level: lvl }).run();
        }}
      >
        <option value="0">Paragraphe</option>
        <option value="1">Titre 1</option>
        <option value="2">Titre 2</option>
        <option value="3">Titre 3</option>
      </select>

      <div class="separator" />

      <!-- Alignement -->
      <button
        on:click={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft size="18" />
      </button>

      <button
        on:click={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter size="18" />
      </button>

      <button
        on:click={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight size="18" />
      </button>

      <div class="separator" />

      <!-- Listes -->
      <button on:click={() => editor.chain().focus().toggleBulletList().run()}>
        <List size="18" />
      </button>

      <button on:click={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size="18" />
      </button>

      <div class="separator" />

      <!-- Undo / Redo -->
      <button on:click={() => editor.chain().focus().undo().run()}>
        <Undo size="18" />
      </button>

      <button on:click={() => editor.chain().focus().redo().run()}>
        <Redo size="18" />
      </button>
    </div>

    <EditorContent {editor} />

    {#each Object.entries(remoteCursors) as [id, c]}
      {#if editor}
        <div
          class="cursor-label"
          style="
            left: {getCursorCoords(c.head).left}px;
            top: {getCursorCoords(c.head).top - 20}px;
            background-color: {c.color};
          "
        >
          {id}
        </div>
      {/if}
    {/each}
  </div>
{/if}
