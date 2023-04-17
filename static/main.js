import { createApp } from "https://unpkg.com/vue@next/dist/vue.esm-browser.prod.js";

const app = createApp({
    components: {
        SeriesManagement: {
            data() {
                return {
                    series: [],
                    new_series: {
                        name: "",
                        is_multi: false,
                        desc: "",
                    },
                };
            },
            methods: {
                async fetchSeries() {
                    const response = await fetch("/api/series/");
                    const data = await response.json();
                    const seriesWithVideoCount = [];

                    for (const s of data) {
                        const videoCountResponse = await fetch(`/api/series/${s.id}/video_count/`);
                        const videoCountData = await videoCountResponse.json();
                        seriesWithVideoCount.push({ ...s, video_count: videoCountData.video_count });
                    }

                    this.series = seriesWithVideoCount;
                },

                async createSeries() {
                    const response = await fetch("/api/series/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(this.new_series),
                    });
                    const data = await response.json();
                    this.series.push(data);
                },

                async deleteSeries(series_id, index) {
                    await fetch(`/api/series/${series_id}/remove/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    this.series.splice(index, 1);
                },
            },
            template: `
                <div class="bg-white p-6 rounded-lg shadow-lg mb-10">
                    <h2 class="text-2xl font-bold mb-4">系列管理</h2>
                    <h4 class="text-xl mb-4">添加新系列</h4>
                        <div class="flex gap-4 mb-4">
                            <input type="text" class="form-control" v-model="new_series.name" placeholder="名称">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" class="form-control" v-model="new_series.is_multi">
                                是否多人系列
                            </label>
                            <input type="text" class="form-control" v-model="new_series.desc" placeholder="描述">
                            <button class="btn btn-primary" @click="createSeries">添加新系列</button>
                        </div>
                                
                    <table class="table w-full">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>名称</th>
                                <th>是否多人</th>
                                <th>描述</th>
                                <th>视频数量</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(s, index) in series">
                                <td>{{ s.id }}</td>
                                <td>{{ s.name }}</td>
                                <td>{{ s.is_multi }}</td>
                                <td>{{ s.desc }}</td>
                                <td>{{ s.video_count }}</td>
                                <td><button class="btn btn-error btn-sm" @click="deleteSeries(s.id, index)">删除系列</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `,
            created() {
                this.fetchSeries();
            },
        },

        VideoManagement: {
            data() {
                return {
                    videos: [],
                    filter: "",
                    series: [],
                    selectedSeries: null,
                    selectedVideos: [],
                    timer: null,
                    selectAll: false,
                    page: 1,
                    totalCount: 0,
                };
            },
            methods: {
                async fetchSeries() {
                    const response = await fetch("/api/series/");
                    const data = await response.json();
                    this.series = data;
                },

                async fetchVideos() {
                    const skip = (this.page - 1) * 100;
                    const response = await fetch(`/api/unassigned-videos/?skip=${skip}&limit=100&search=${this.filter}`);
                    const data = await response.json();
                    this.videos = data.videos;
                    this.totalCount = data.total_count;
                },

                filterVideos() {
                    clearTimeout(this.timer);
                    this.timer = setTimeout(this.fetchVideos, 600);
                },

                async assignVideosToSeries() {
                    if (!this.selectedSeries) {
                        return;
                    }

                    await fetch(`/api/series/${this.selectedSeries}/videos/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(this.selectedVideos),
                    });

                    this.selectedVideos = [];
                    this.fetchVideos();
                },

                toggleSelectAll() {
                    if (this.selectAll) {
                        this.selectedVideos = this.videos.map(v => v.id);
                    } else {
                        this.selectedVideos = [];
                    }
                },

                toggleVideoSelection(videoId) {
                    const index = this.selectedVideos.indexOf(videoId);
                    if (index === -1) {
                        this.selectedVideos.push(videoId);
                    } else {
                        this.selectedVideos.splice(index, 1);
                    }
                },
            },

            watch: {
                selectedVideos() {
                    if (this.selectedVideos.length === this.videos.length) {
                        this.selectAll = true;
                    } else {
                        this.selectAll = false;
                    }
                },
            },

            computed: {
                totalPages() {
                    return Math.ceil(this.totalCount / 100);
                },
            },

            template: `
                <div class="bg-white p-6 rounded-lg shadow-lg">
                    <h2 class="text-2xl font-bold mb-4">视频管理</h2>
                    <div class="flex gap-4 mb-4">
                        <input type="text" v-model="filter" @input="filterVideos" placeholder="筛选视频" class="form-control">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
                            全选
                        </label>
                        <select v-model="selectedSeries" class="form-select">
                            <option v-for="s in series" :value="s.id">{{ s.name }}</option>
                        </select>
                        <button class="btn btn-primary" @click="assignVideosToSeries">分配视频到系列</button>
                    </div>
                    <div class="mb-4">
                        <nav>
                            <ul class="pagination flex items-center gap-2">
                                <li>
                                    <button :disabled="page === 1"
                                            class="btn btn-outline-secondary"
                                            @click.prevent="page > 1 && (page--, fetchVideos())">
                                        <span aria-hidden="true">&laquo;</span>
                                    </button>
                                </li>
                                <li>
                                    <button class="btn btn-ghost" @click.prevent="fetchVideos()">{{ page }}</button>
                                </li>
                                <li>
                                    <span>/ {{ totalPages }}</span>
                                </li>
                                <li>
                                    <button :disabled="page === totalPages"
                                            class="btn btn-outline-secondary"
                                            @click.prevent="page < totalPages && (page++, fetchVideos())">
                                        <span aria-hidden="true">&raquo;</span>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                    <table class="table w-full">
                        <thead>
                            <tr>
                                <th>选择</th>
                                <th>ID</th>
                                <th>标题</th>
                                <th>描述</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="v in videos" @click="toggleVideoSelection(v.id)" class="cursor-pointer">
                                <td>
                                    <input type="checkbox" v-model="selectedVideos" :value="v.id" @click.stop>
                                </td>
                                <td>{{ v.id }}</td>
                                <td class="ellipsis video-field">{{ v.title }}</td>
                                <td class="ellipsis video-field">{{ v.desc }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `,
            created() {
                this.fetchVideos();
                this.fetchSeries();
            },
        },
    },
});

app.mount("#app");
