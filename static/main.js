import { createApp } from "https://unpkg.com/vue@next/dist/vue.esm-browser.prod.js";
import SeriesManagement from "./components/SeriesManagement.js";
import VideoManagement from "./components/VideoManagement.js";

const app = createApp({
    components: {
        SeriesManagement,
        VideoManagement,
    },
});

app.mount("#app");
