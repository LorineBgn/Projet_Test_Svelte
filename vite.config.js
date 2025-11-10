import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";

/** @type {import('vite').UserConfig} */
export default {
  plugins: [
    svelte({
      preprocess: sveltePreprocess()
    }),
  ],
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
};

