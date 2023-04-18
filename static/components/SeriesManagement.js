export default {
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
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" class="hidden" v-model="new_series.is_multi">
                        <div :class="{'border': true, 'border-blue-500': new_series.is_multi, 'border-gray-300': !new_series.is_multi, 'rounded-full': true, 'w-6': true, 'h-6': true, 'flex': true, 'justify-center': true, 'items-center': true}" @click="new_series.is_multi = !new_series.is_multi">
                            <i :class="{'fas': true, 'fa-check': new_series.is_multi, 'text-blue-500': new_series.is_multi, 'text-opacity-0': !new_series.is_multi}"></i>
                        </div>
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
}