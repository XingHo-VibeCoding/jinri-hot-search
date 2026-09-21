/* 今日热搜 — 页面逻辑（PRD F1~F4） */
const COUNT = 20; // 每批展示条数（PRD F1）
let pool = []; // 数据池（PRD A7：≥40 条）
const highlighted = new Set(); // 高亮按标题跟随条目（PRD F2/F3）

const list = document.getElementById('list');
const dateEl = document.getElementById('date');
const errEl = document.getElementById('error');

/* 洗牌：换一批从数据池随机取（PRD F2） */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function render(items) {
  list.innerHTML = '';
  items.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = 'item' + (highlighted.has(item.title) ? ' hit' : '');
    li.innerHTML =
      '<span class="rank ' + (idx < 3 ? 'r' + (idx + 1) : '') + '">' + (idx + 1) + '</span>' +
      '<span class="title"></span>' +
      '<span class="heat">' + item.heat.toLocaleString() + '</span>' +
      '<span class="src src-' + item.source + '">' + item.source + '</span>';
    li.querySelector('.title').textContent = item.title; // textContent 防注入
    li.addEventListener('click', () => {
      if (highlighted.has(item.title)) {
        highlighted.delete(item.title);
        li.classList.remove('hit');
      } else {
        highlighted.add(item.title);
        li.classList.add('hit');
      }
    });
    list.appendChild(li);
  });
}

function draw() {
  render(shuffle(pool).slice(0, COUNT));
}

/* 首屏：按热度取前 20（真实榜单语义）；换一批：随机 20 条（PRD F2） */
function initial() {
  render(pool.slice(0, COUNT));
}

/* 数据来源：静态 JSON（tech.md 决策），Day 23 换数据库时只改这里 */
fetch('data/hot-data.json')
  .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
  .then(data => {
    pool = data.items;
    dateEl.textContent = data.date + ' 热点榜'; // F4：日期来自数据文件（PRD A9）
    document.getElementById('updated').textContent =
      '数据更新于 ' + data.date + ' · 数据池共 ' + pool.length + ' 条';
    initial();
  })
  .catch(e => {
    errEl.classList.remove('hidden');
    console.error(e);
  });

document.getElementById('shuffleBtn').addEventListener('click', () => {
  draw();
  window.scrollTo({ top: 0, behavior: 'smooth' }); // 换一批后回顶部，榜单从头看
});
