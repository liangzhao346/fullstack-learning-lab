<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
const tab = ref('products'), system = ref(null), products = ref({ items: [], total: 0, page: 0, size: 8 }), orders = ref({ items: [], total: 0, page: 0, size: 8 }), options = ref([]), metrics = ref({}), query = ref(''), busy = ref(false), notice = ref(''), failure = ref(''), trace = ref(null), selected = ref(null);
const draft = ref({ sku: '', name: '', price: 49.9, stock: 20, version: 0 });
const order = ref({ productId: 0, quantity: 1, requestKey: crypto.randomUUID() });
const scenario = ref('penetration'), requestCount = ref(24), labBusy = ref(false), results = ref([]);
const tabs = [['products', '01', '商品与库存'], ['orders', '02', '订单与事务'], ['labs', '03', '缓存实验室'], ['learn', '04', '学习地图']];
const scenarios = { penetration: { title: '缓存穿透', problem: '不断请求数据库里也不存在的数据。', solution: '短期缓存空值，让相同的无效请求不再反复查库。' }, breakdown: { title: '缓存击穿', problem: '热门商品缓存过期，同时涌入大量请求。', solution: '同一个进程内合并同一 key 的回源请求，等待首个请求填充缓存。' }, avalanche: { title: '缓存雪崩', problem: '许多商品缓存集中失效，数据库同时承受回源。', solution: '对 TTL 增加抖动，让失效时间分散；全缓存故障另需限流或降级。' }, outage: { title: '缓存故障', problem: '模拟缓存读取不可用，观察请求是否全部失败。', solution: '有界回源，限制数据库并发，超过预算的请求明确拒绝。' } };
async function api(path, { method = 'GET', body, quiet = false } = {}) {
    const start = performance.now(); let res, data;
    try { res = await fetch('/api' + path, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined }); data = await res.json(); }
    catch (e) { if (!quiet) trace.value = { method, url: '/api' + path, status: '网络错误', body, response: String(e) }; throw new Error('无法连接 API。请确认 Spring Boot 已启动，且代理地址与后端端口一致。'); }
    if (!quiet) trace.value = { method, url: '/api' + path, status: res.status, elapsedMs: Math.round(performance.now() - start), body: body ?? null, response: data };
    if (!res.ok) throw new Error(`${data.message || '请求失败'}${data.details && Object.keys(data.details).length ? ' · ' + Object.entries(data.details).map(([k, v]) => k + ': ' + v).join('；') : ''} [${data.code || res.status}] · ${data.requestId || ''}`);
    return data.data;
}
async function run(fn) { busy.value = true; failure.value = ''; notice.value = ''; try { await fn(); } catch (e) { failure.value = e.message; } finally { busy.value = false; } }
async function loadProducts(quiet = true) { products.value = await api(`/products?page=${products.value.page}&size=8&q=${encodeURIComponent(query.value)}`, { quiet }); options.value = (await api('/products?size=50', { quiet: true })).items; if (!order.value.productId && options.value.length) order.value.productId = options.value[0].id; }
async function loadOrders() { orders.value = await api(`/orders?page=${orders.value.page}&size=8`, { quiet: true }); }
async function refreshMetrics() { metrics.value = await api('/metrics/cache', { quiet: true }); }
async function refresh() { await run(async () => { system.value = await api('/system', { quiet: true }); await loadProducts(); await loadOrders(); await refreshMetrics(); }); }
function resetDraft() { selected.value = null; draft.value = { sku: '', name: '', price: 49.9, stock: 20, version: 0 }; }
function edit(p) { selected.value = p.id; draft.value = { sku: p.sku, name: p.name, price: Number(p.price), stock: p.stock, version: p.version }; }
async function save() { await run(async () => { await api(selected.value ? '/products/' + selected.value : '/products', { method: selected.value ? 'PUT' : 'POST', body: draft.value }); notice.value = selected.value ? '修改已保存。旧版本再次提交会返回 409。' : '商品已创建。'; resetDraft(); await loadProducts(); }); }
async function remove(p) { if (!confirm(`删除 ${p.name}？有订单引用的商品会返回 409。`)) return; await run(async () => { await api('/products/' + p.id, { method: 'DELETE' }); notice.value = '商品已删除'; await loadProducts(); }); }
async function detail(p) { await run(async () => { await api('/products/' + p.id); await refreshMetrics(); notice.value = '商品详情请求已完成。再点一次，观察缓存命中与回源计数。'; }); }
function newOrderKey() { order.value.requestKey = crypto.randomUUID(); }
function chooseOrder(p) { order.value = { productId: p.id, quantity: 1, requestKey: crypto.randomUUID() }; tab.value = 'orders'; }
async function placeOrder() { await run(async () => { const placed = await api('/orders', { method: 'POST', body: order.value }); notice.value = '订单 ' + placed.id + ' 已返回；同一标识与内容重复发送会返回同一订单。'; await loadProducts(); await loadOrders(); }); }
async function experiment() { labBusy.value = true; failure.value = ''; results.value = []; try { for (const mode of ['naive', 'guarded']) results.value.push(await api('/labs/cache/run', { method: 'POST', body: { scenario: scenario.value, mode, requests: requestCount.value } })); } catch (e) { failure.value = e.message; } finally { labBusy.value = false; } }
const ttlBars = computed(() => results.value.find(r => r.mode === 'guarded')?.seededTtlMs || []);
const steps = [['先看 HTTP', '在商品列表点「读缓存」，查看下方请求方法、地址、响应和 requestId。', 'client/src/App.vue → fetch /api/products/{id}'], ['理解 Spring Boot', '应用入口负责启动内嵌服务；Controller 接收请求，校验 DTO，调用 Service。', 'LabApplication → ApiController → ProductService'], ['读懂数据库', '对照迁移 SQL 和 Repository，观察表、主键、唯一键、外键、分页查询与参数绑定。', 'V1__catalog_and_orders.sql → ProductRepository'], ['验证事务与并发', '用库存为 1 的商品下两次订单；用同一 requestKey 重发，再修改内容观察冲突。', 'OrderService → OrderTransaction → conditional UPDATE'], ['观察缓存异常', '同一批请求，比较原始实现与保护方案的数据库读取次数，不只看响应时间。', 'CacheReader → CacheStore → LabService'], ['切到真实服务', '本地模式是 H2 + 可过期本地缓存；准备 Docker 后按 README 切换 MySQL/Redis。', 'compose.yml → mysql-redis profile']];
let retryTimer; onMounted(async () => { await refresh(); let tries = 0; retryTimer = setInterval(async () => { if (system.value || tries++ >= 12) { clearInterval(retryTimer); return; } if (!busy.value) await refresh(); }, 1500); }); onBeforeUnmount(() => clearInterval(retryTimer));
</script>

<template>
    <div class="shell">
        <aside><a class="brand" href="#"><span class="brand-mark">FL</span><span>Fullstack
                    Lab<small>从界面到数据</small></span></a>
            <div class="nav-label">LEARNING WORKSPACE</div>
            <nav><button v-for="[key, no, label] in tabs" :key="key" :class="{ active: tab === key }"
                    @click="tab = key; failure = ''; notice = ''"><span>{{ no }}</span>{{ label }}<b>↗</b></button></nav>
            <div class="side-note"><span class="dot"></span> 为理解而构建<p>一个业务链路，四层知识。<br>先观察，再修改，最后验证。</p>
            </div>
            <div class="stack">VUE 3 · SPRING BOOT<br>SQL · CACHE · TRANSACTION</div>
        </aside>
        <main>
            <header>
                <div><span class="eyebrow">YOUR FULLSTACK JOURNEY</span>
                    <h1>{{tabs.find(t => t[0] === tab)?.[2]}}</h1>
                </div>
                <div class="mode"><span class="dot" :class="{ offline: !system }"></span>{{ system ? system.database + ' /'+system.cache:'API 未连接'}}<button @click="refresh" :disabled="busy">↻ 刷新</button></div>
            </header>
            <div class="mode-banner" v-if="system?.cache === 'local-demo'"><b>本地学习模式</b><span>真实 Spring Boot + H2 SQL
                    数据库；缓存由本地可过期存储演示。切换真实 MySQL/Redis 的步骤见项目 README。</span></div>
            <div class="alert error" role="alert" v-if="failure">{{ failure }}</div>
            <div class="alert success" role="status" v-if="notice">{{ notice }}</div>
            <section class="metrics">
                <div><span>商品记录</span><strong>{{ products.total }}</strong><small>SQL 分页与持久化</small></div>
                <div><span>有效订单</span><strong>{{ orders.total }}</strong><small>事务 + 幂等提交</small></div>
                <div><span>商品详情缓存命中</span><strong>{{ metrics.hits || 0 }}</strong><small>包含空值缓存命中</small></div>
                <div><span>详情请求回源</span><strong>{{ metrics.dbReads || 0 }}</strong><small>不含列表和写入 SQL</small></div>
            </section>
            <section v-if="tab === 'products'" class="two-column">
                <article class="panel">
                    <div class="panel-title">
                        <div>
                            <h2>商品目录</h2>
                            <p>增删改查、分页与版本冲突，从这里开始。</p>
                        </div><span class="chip">CATALOG</span>
                    </div>
                    <form class="search" @submit.prevent="products.page = 0; run(() => loadProducts(false))"><input
                            v-model="query" placeholder="搜索商品名或 SKU" maxlength="80"><button class="secondary"
                            :disabled="busy">搜索</button></form>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>商品 / SKU</th>
                                    <th>价格</th>
                                    <th>库存</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="p in products.items" :key="p.id">
                                    <td><b>{{ p.name }}</b><small>{{ p.sku }} · v{{ p.version }}</small></td>
                                    <td>¥{{ Number(p.price).toFixed(2) }}</td>
                                    <td><span class="stock" :class="{ low: p.stock < 5 }">{{ p.stock }}</span></td>
                                    <td class="actions"><button @click="detail(p)" :disabled="busy">读缓存</button><button
                                            @click="edit(p)">编辑</button><button
                                            @click="chooseOrder(p)">下单</button><button class="danger" @click="remove(p)"
                                            :disabled="busy">删除</button></td>
                                </tr>
                                <tr v-if="!products.items.length">
                                    <td colspan="4" class="empty">暂无数据，先确认 API 已连接，或创建第一个商品。</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="pagination"><span>第 {{ products.page + 1 }} 页 · 共 {{ products.total }} 条</span>
                        <div><button :disabled="busy || products.page === 0"
                                @click="products.page--; run(() => loadProducts())">←</button><button
                                :disabled="busy || (products.page + 1) * 8 >= products.total"
                                @click="products.page++; run(() => loadProducts())">→</button></div>
                    </div>
                </article>
                <article class="panel">
                    <div class="panel-title">
                        <div>
                            <h2>{{ selected ? '编辑商品' : '创建商品' }}</h2>
                            <p>后端会再次校验输入，不能只依赖页面。</p>
                        </div>
                    </div>
                    <form class="editor" @submit.prevent="save"><label>SKU<input v-model="draft.sku" required
                                pattern="[A-Za-z0-9-]{2,40}" placeholder="例如 BOOK-001"></label><label>商品名称<input
                                v-model="draft.name" required maxlength="120" placeholder="输入商品名称"></label>
                        <div class="form-grid"><label>价格<input type="number" v-model.number="draft.price" min="0.01"
                                    max="99999999" step="0.01" required></label><label>库存<input type="number"
                                    v-model.number="draft.stock" min="0" max="1000000" step="1" required></label></div>
                        <div class="hint" v-if="selected">提交版本：{{ draft.version }}。另一个页面修改后，本次提交会因版本过期而被拒绝。</div><button
                            class="primary" :disabled="busy">{{ selected ? '保存修改' : '创建商品' }} ↗</button><button type="button"
                            class="text-button" @click="resetDraft">重置表单</button>
                    </form>
                </article>
            </section>
            <section v-if="tab === 'orders'" class="two-column">
                <article class="panel">
                    <div class="panel-title">
                        <div>
                            <h2>创建与重放订单</h2>
                            <p>库存扣减和订单创建在同一数据库事务内完成。</p>
                        </div><span class="chip">TRANSACTION</span>
                    </div>
                    <form class="editor" @submit.prevent="placeOrder"><label>商品<select v-model.number="order.productId"
                                required>
                                <option v-for="p in options" :value="p.id">{{ p.name }} · 库存 {{ p.stock }}</option>
                            </select></label><label>数量<input v-model.number="order.quantity" type="number" min="1"
                                max="1000" required></label><label>本次提交标识<input v-model="order.requestKey" required
                                minlength="8" maxlength="80"></label>
                        <div class="hint">保持标识与订单内容不变再次提交，观察返回的订单 ID 和库存。修改内容但沿用标识会返回 409。</div><button class="primary"
                            :disabled="busy || !order.productId">提交 / 重放同一订单 ↗</button><button type="button"
                            class="text-button" @click="newOrderKey">生成新订单标识</button>
                    </form>
                </article>
                <article class="panel">
                    <div class="panel-title">
                        <div>
                            <h2>订单记录</h2>
                            <p>价格来自数据库，页面不提交订单金额。</p>
                        </div>
                    </div>
                    <div class="order-card" v-for="o in orders.items" :key="o.id">
                        <div><b>商品 #{{ o.productId }} × {{ o.quantity }}</b><strong>¥{{ Number(o.total).toFixed(2) }}</strong>
                        </div><small>{{ o.id }}</small><small>幂等标识：{{ o.requestKey }}</small>
                    </div>
                    <div v-if="!orders.items.length" class="empty">还没有订单。</div>
                    <div class="pagination"><span>共 {{ orders.total }} 条</span>
                        <div><button :disabled="busy || orders.page === 0"
                                @click="orders.page--; run(loadOrders)">←</button><button
                                :disabled="busy || (orders.page + 1) * 8 >= orders.total"
                                @click="orders.page++; run(loadOrders)">→</button></div>
                    </div>
                </article>
            </section>
            <section v-if="tab === 'labs'">
                <div class="scenario-grid"><button v-for="(s, key) in scenarios" :key="key" class="scenario"
                        :class="{ selected: scenario === key }" @click="scenario = key; results = []"
                        :disabled="labBusy"><span>{{ key.toUpperCase() }}</span>
                        <h2>{{ s.title }}</h2>
                        <p>{{ s.problem }}</p>
                    </button></div>
                <article class="panel lab">
                    <div class="panel-title">
                        <div>
                            <h2>{{ scenarios[scenario].title }} · 对照实验</h2>
                            <p>{{ scenarios[scenario].solution }}</p>
                        </div><span class="chip">CONTROLLED EXPERIMENT</span>
                    </div>
                    <div class="lab-controls"><label>请求数量 <b>{{ requestCount }}</b><input type="range" min="8" max="60"
                                step="4" v-model.number="requestCount" :disabled="labBusy"></label><button
                            class="primary" @click="experiment"
                            :disabled="labBusy || !system">{{ labBusy ? '正在执行两组实验…' : '运行原始与保护方案' }} ↗</button></div>
                    <p class="hint">实验使用真实 SQL 读取，最多 8 个并发工作线程。短 TTL 和 35ms 延迟用于放大现象；预热不计入回源计数。每次独立缓存命名空间，不清空业务缓存。</p>
                    <div class="results" v-if="results.length">
                        <div class="result" v-for="r in results" :key="r.mode">
                            <div class="result-head">
                                <h3>{{ r.mode === 'guarded' ? '保护方案' : '原始实现' }}</h3><span>{{ r.elapsedMs }} ms</span>
                            </div>
                            <div class="result-numbers">
                                <div><b>{{ r.metrics.dbReads }}</b><span>数据库回源</span></div>
                                <div><b>{{ r.metrics.hits }}</b><span>缓存命中</span></div>
                                <div><b>{{ r.failedRequests }}</b><span>失败请求</span></div>
                                <div><b>{{ r.metrics.rejected }}</b><span>回源限额拒绝</span></div>
                            </div>
                            <div class="bar"><i
                                    :style="{ width: Math.min(100, r.metrics.dbReads / requestCount * 100) + '%' }"></i></div>
                            <small>缓存错误 {{ r.metrics.cacheErrors }} · 空值命中 {{ r.metrics.negativeHits }} ·
                                {{ r.cacheBackend }}</small>
                        </div>
                    </div>
                    <div class="ttl" v-if="ttlBars.length"><span>保护方案预热 TTL 分布（越高越晚过期）</span>
                        <div><i v-for="(n, i) in ttlBars" :key="i" :style="{ height: n / 16 + 'px' }" :title="n + 'ms'"></i></div>
                    </div>
                </article>
            </section>
            <section v-if="tab === 'learn'" class="learning-grid">
                <article class="panel lesson" v-for="(s, i) in steps" :key="s[0]"><span
                        class="lesson-number">{{ String(i + 1).padStart(2, '0') }}</span>
                    <h2>{{ s[0] }}</h2>
                    <p>{{ s[1] }}</p><code>{{ s[2] }}</code>
                </article>
            </section>
            <article class="panel inspector">
                <div class="panel-title">
                    <div>
                        <h2>请求观察窗</h2>
                        <p>把页面操作与实际 HTTP 响应对应起来。</p>
                    </div><span class="chip">{{ trace ? trace.method + ' ' + trace.status : 'WAITING' }}</span>
                </div>
                <pre v-if="trace">{{ JSON.stringify(trace, null, 2) }}</pre>
                <div class="empty" v-else>点击「读缓存」、提交表单或运行实验，观察请求与响应。</div>
            </article>
            <footer>FULLSTACK LAB / Learning by tracing one complete request.<span>本地学习应用 · 无登录、支付或生产部署配置</span>
            </footer>
        </main>
    </div>
</template>
