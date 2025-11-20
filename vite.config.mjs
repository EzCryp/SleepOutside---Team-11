
import { resolve } from "path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  root: "src/",
  base: "/",
  build: {
    outDir: "../dist",
    target: "esnext",
    rollupOptions: {
      input: {
        main: resolve("src/index.html"),
        cart: resolve("src/cart/index.html"),
        checkout: resolve("src/checkout/index.html"),
        product: resolve("src/product_pages/index.html"),
        product_listing: resolve("src/product_listing/index.html"),
      },
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "partials/*",   
          dest: "partials"  
        }
      ]
    })
  ]
});
