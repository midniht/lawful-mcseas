import { defineConfig } from "vite";
import monkey, { util, cdn } from "vite-plugin-monkey";
// https://github.com/unplugin/unplugin-auto-import
// import AutoImport from "unplugin-auto-import/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // AutoImport({
    //   imports: [util.unimportPreset], // 按需自动导入 GM_api
    // }),
    monkey({
      entry: "src/main.ts",
      userscript: {
        name: { en: "Lawful MC seas", "zh-CN": "秩序心海" },
        namespace: "https://mcseas.club/home.php?mod=space&uid=95082",
        version: "0.3.4-alpha",
        description: {
          en: "Improve the user experience of mcseas.",
          "zh-CN": "改善「混沌心海」论坛的使用体验。",
        },
        author: "miyoi",
        homepage: "https://mcseas.club/forum.php?mod=viewthread&tid=50579",
        license: "MIT",
        match: ["*://mcseas.club/*"],
        icon: "https://mcseas.club/favicon.ico",
        require: ["https://unpkg.com/heti/umd/heti-addon.min.js"],
        resource: { css: "https://unpkg.com/heti/umd/heti.min.css" },
        "run-at": "document-end",
      },
      // build: {
      //   externalGlobals: {
      //     heti: cdn.unpkg("heti", "umd/heti-addon.min.js"),
      //   },
      //   externalResource: {
      //     "heti/umd/heti.min.css": cdn.unpkg(),
      //   },
      // },
      // server: { mountGmApi: true }, // 全局变量导入 GM_api
    }),
  ],
  build: {
    // minify: true,
  },
});
