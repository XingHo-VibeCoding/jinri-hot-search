/* 今日热搜 — 页面逻辑（PRD F1~F4 + Day 8 四种页面状态） */
const COUNT = 20; // 每批展示条数（PRD F1）
let pool = []; // 数据池（PRD A7：≥40 条）
const highlighted = new Set(); // 高亮按标题跟随条目（PRD F2/F3）

const list = document.getElementById('list');
const dateEl = document.getElementById('date');
const els = {
  loading: document.getElementById('loading'),
  empty: document.getElementById('empty'),
  error: document.getElementById('error'),
  errorMsg: document.getElementById('errorMsg'),
};

/* Day 8 核心改动：页面四态统一调度，同一时刻只显示一种
 * loading（骨架屏）/ empty（数据池为空）/ error（请求失败+重试）/ normal（榜单，即 list 本身） */
function showState(name) {
  els.loading.classList.toggle('hidden', name !== 'loading');
  els.empty.classList.toggle('hidden', name !== 'empty');
  els.error.classList.toggle('hidden', name !== 'error');
  list.classList.toggle('hidden', name !== 'normal');
}

/* 洗牌：换一批从数据池随机取（PRD F2） */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* 渲染交给可复用组件（Day 8 余力加练）：main.js 只管状态，卡片长什么样归 HotCard 管 */
function render(items) {
  HotCard.renderList(list, items, { highlighted });
}

function draw() {
  render(shuffle(pool).slice(0, COUNT));
}

/* 首屏：按热度取前 20（真实榜单语义）；换一批：随机 20 条（PRD F2） */
function initial() {
  render(pool.slice(0, COUNT));
}

/* 数据加载：mock 数据来自本地 JSON（tech.md 决策），Day 23 换数据库时只改这里的 fetch 地址 */
function load() {
  showState('loading'); // 状态 1：加载中
  fetch('data/hot-data.json')
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(data => {
      pool = data.items;
      if (!pool || pool.length === 0) { showState('empty'); return; } // 状态 2：空
      dateEl.textContent = data.date + ' 热点榜'; // F4：日期来自数据文件（PRD A9）
      document.getElementById('updated').textContent =
        '数据更新于 ' + data.date + ' · 数据池共 ' + pool.length + ' 条';
      initial();
      showState('normal'); // 状态 4：正常
    })
    .catch(e => {
      els.errorMsg.textContent = '数据加载失败（' + e.message + '）。file:// 直开会拦 fetch，请用本地服务器访问。';
      showState('error'); // 状态 3：错误
      console.error(e);
    });
}

document.getElementById('retryBtn').addEventListener('click', load); // 错误态一键重试

document.getElementById('shuffleBtn').addEventListener('click', () => {
  if (!pool.length) return; // 数据没到位时不响应换一批
  draw();
  window.scrollTo({ top: 0, behavior: 'smooth' }); // 换一批后回顶部，榜单从头看
});

load();
