// 小红书搜索 + 详情页正文抓取脚本（配合浏览器 run-code 使用）
// 使用方法：在浏览器已登录小红书的 target 上，通过 run-browser.py run-code 执行各函数返回的结果。

// 第一步：搜索某关键词，返回笔记列表（id + xsecToken + title + user + liked）
function searchList(keyword) {
  return new Promise((resolve) => {
    const url = 'https://www.xiaohongshu.com/search_result?keyword=' + encodeURIComponent(keyword) + '&source=web_search_result_notes';
    location.href = url;
    setTimeout(() => {
      const s = window.__INITIAL_STATE__ || {};
      const raw = (s.search && s.search.feeds) ? (s.search.feeds._value !== undefined ? s.search.feeds._value : s.search.feeds._rawValue) : [];
      const items = [];
      (raw || []).forEach(f => {
        const n = f && f.noteCard;
        if (!n || !n.displayTitle) return;
        items.push({
          id: f.id,
          xsec: f.xsecToken,
          title: String(n.displayTitle),
          user: n.user ? String(n.user.nickname) : '',
          liked: n.interactInfo ? String(n.interactInfo.likedCount) : '',
          comments: n.interactInfo ? String(n.interactInfo.commentCount) : ''
        });
      });
      resolve(items);
    }, 2500);
  });
}

// 第二步：读取当前详情页正文
function readDetail() {
  const is404 = location.href.includes('/404');
  const s = window.__INITIAL_STATE__ || {};
  const note = s.note || {};
  const map = note.noteDetailMap || {};
  const keys = Object.keys(map);
  let out = { is404, desc: '', title: '', user: '', liked: '', type: '' };
  if (keys.length) {
    const n = map[keys[0]] && map[keys[0]].note;
    if (n) {
      out.title = String(n.title || '');
      out.desc = n.desc ? String(n.desc) : '';
      out.user = n.user ? String(n.user.nickname || '') : '';
      out.liked = n.interactInfo ? String(n.interactInfo.likedCount || '') : '';
      out.type = String(n.type || '');
    }
  }
  return out;
}
