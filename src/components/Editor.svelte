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

  import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Highlighter,
    Undo,
    Redo,
    Type,
    SunMoon,
  } from "lucide-svelte";

  import * as Y from "yjs";
  import { supabase } from "../lib/Supabase.js";

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
    channel.subscribe((status) => console.log("Supabase channel:", status));

    return { channel };
  }

  let editor;
  let provider;
  const ydoc = new Y.Doc();

  // Toggle dark mode
  let dark = false;

  onMount(() => {
    // Connexion à Realtime
    provider = createProvider(supabase, "doc", ydoc);

    // Instanciation de l'éditeur (TipTap + Yjs)
    editor = new Editor({
      extensions: [
        StarterKit,
        TextStyle,
        Color,
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
    });

    return () => {
      editor?.destroy();
      provider?.channel?.unsubscribe();
    };
  });
</script>

{#if editor}
  <div class="editor-wrapper">
    <div class="toolbar">
      <div class="toolbar-group">
        <!-- Gras -->
        <button
          on:click={() => editor.chain().focus().toggleBold().run()}
          class:active={editor.isActive("bold")}
        >
          <Bold size="18" />
        </button>

        <!-- Italique -->
        <button
          on:click={() => editor.chain().focus().toggleItalic().run()}
          class:active={editor.isActive("italic")}
        >
          <Italic size="18" />
        </button>

        <!-- Souligné -->
        <button
          on:click={() => editor.chain().focus().toggleUnderline().run()}
          class:active={editor.isActive("underline")}
        >
          <Underline size="18" />
        </button>

        <!-- Couleur de texte -->
        <input
          type="color"
          on:input={(e) =>
            editor.chain().focus().setColor(e.target.value).run()}
        />

        <!-- Surlignage (hack simple) -->
        <button
          on:click={() => editor.chain().focus().setColor("yellow").run()}
        >
          <Highlighter size="18" />
        </button>

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

        <!-- Listes -->
        <button
          on:click={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size="18" />
        </button>

        <button
          on:click={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size="18" />
        </button>

        <!-- Undo / Redo -->
        <button on:click={() => editor.chain().focus().undo().run()}>
          <Undo size="18" />
        </button>

        <button on:click={() => editor.chain().focus().redo().run()}>
          <Redo size="18" />
        </button>
      </div>

      <div class="toolbar-group">
        <button
          on:click={() => {
            dark = !dark;
            document.body.classList.toggle("dark", dark);
          }}
        >
          <SunMoon size={24} />
        </button>
      </div>

      <div class="editor-page">
        <EditorContent {editor} />
      </div>
    </div>
  </div>
{/if}
