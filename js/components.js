/* 今日热搜 — 可复用卡片与列表组件（Day 8 余力加练）
 * HotCard.create(item, idx, opts)  -> 返回一条热搜卡片 DOM
 * HotCard.renderList(el, items, opts) -> 整批渲染进容器，返回卡片数组
 * 约定：组件不知道数据从哪来（mock / 真实 API 都能用），只负责"一条数据 -> 一张卡片"。
 */
const HotCard = {
  /**
   * @param {Object}  item          { title, heat, source }
   * @param {number}  idx           在当前榜单中的名次（从 0 开始）
   * @param {Object}  [opts]
   * @param {Set}     [opts.highlighted]   已看标题集合（命中的卡片加 .hit）
   * @param {Function}[opts.onToggle]      (item, cardEl, isHit) 点击卡片回调
   */
  create(item, idx, opts = {}) {
    const highlighted = opts.highlighted || new Set();
    const li = document.createElement('li');
    li.className = 'item' + (highlighted.has(item.title) ? ' hit' : '');
    li.innerHTML =
      '<span class="rank ' + (idx < 3 ? 'r' + (idx + 1) : '') + '">' + (idx + 1) + '</span>' +
      '<span class="title"></span>' +
      '<span class="heat">' + item.heat.toLocaleString() + '</span>' +
      '<span class="src src-' + item.source + '">' + item.source + '</span>';
    li.querySelector('.title').textContent = item.title; // textContent 防注入
    li.addEventListener('click', () => {
      const isHit = highlighted.has(item.title);
      if (isHit) {
        highlighted.delete(item.title);
        li.classList.remove('hit');
      } else {
        highlighted.add(item.title);
        li.classList.add('hit');
      }
      if (opts.onToggle) opts.onToggle(item, li, !isHit);
    });
    return li;
  },

  /** 整批渲染：先清空容器，再逐条生成卡片 */
  renderList(container, items, opts = {}) {
    container.innerHTML = '';
    const cards = items.map((item, idx) => this.create(item, idx, opts));
    cards.forEach(card => container.appendChild(card));
    return cards;
  }
};
