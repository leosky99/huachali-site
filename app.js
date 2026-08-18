// DoorGo 攻略站渲染逻辑
(function () {
  var grid = document.getElementById('guideGrid');
  var catNav = document.getElementById('catNav');
  var searchInput = document.getElementById('searchInput');
  var currentCat = 'all';
  var currentQuery = '';

  var CAT_LABEL = {
    account: '港澳开户',
    card: '香港信用卡',
    refund: '付费服务'
  };

  function matches(g) {
    if (currentCat === 'paid') return !!g.paid;
    if (currentCat !== 'all') return false;
    if (currentQuery) {
      var q = currentQuery.toLowerCase();
      var hay = (g.title + ' ' + g.desc + ' ' + (g.tags || []).join(' ')).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function renderGuides() {
    var list = GUIDES.filter(matches);
    if (!list.length) {
      grid.innerHTML = '<p style="text-align:center;color:var(--muted);grid-column:1/-1">没有找到相关内容，换个关键词试试。</p>';
      return;
    }

    function cardHtml(g) {
      return '<div class="guide" onclick="openGuide(\'' + g.id + '\')">'
        + '<div class="thumb ' + g.thumb + '">' + g.icon
        + '<span class="cat">' + CAT_LABEL[g.cat] + '</span>'
        + (g.hot ? '<span class="soon" style="background:#E0524D">热门</span>' : '')
        + (g.paid ? '<span class="soon" style="background:var(--gold)">' + g.price + '</span>' : '')
        + '</div>'
        + '<div class="g-body">'
        + '<h3>' + g.title + '</h3>'
        + '<p>' + g.desc + '</p>'
        + '<div class="g-more">查看攻略 →</div>'
        + '</div></div>';
    }

    // 在「全部攻略」视图下按子类分组（开户 / 信用卡 / 付费），做成可折叠的手风琴
    if (currentCat === 'all') {
      var groups = [
        { key: 'account', label: '🏦 港澳开户' },
        { key: 'card', label: '💳 香港信用卡' },
        { key: 'paid', label: '💎 付费服务' }
      ];
      var html = '';
      groups.forEach(function (grp) {
        var items = list.filter(function (g) {
          if (grp.key === 'paid') return !!g.paid;
          return g.cat === grp.key;
        });
        if (!items.length) return;
        html += '<div class="acc-group">'
          + '<button class="group-title" type="button" onclick="toggleGroup(this)">'
          + '<span>' + grp.label + '</span>'
          + '<span class="acc-count">' + items.length + ' 篇</span>'
          + '<span class="acc-arrow">▾</span>'
          + '</button>'
          + '<div class="group-cards acc-body" style="display:none">' + items.map(cardHtml).join('') + '</div>'
          + '</div>';
      });
      grid.innerHTML = html;
    } else {
      grid.innerHTML = list.map(cardHtml).join('');
    }
  }

  // 手风琴展开/收起
  window.toggleGroup = function (btn) {
    var body = btn.nextElementSibling;
    var arrow = btn.querySelector('.acc-arrow');
    if (!body) return;
    var isOpen = body.style.display !== 'none';
    body.style.display = isOpen ? 'none' : 'grid';
    arrow.textContent = isOpen ? '▾' : '▴';
  };

  if (catNav) {
    catNav.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      currentCat = btn.getAttribute('data-cat');
      catNav.querySelectorAll('button').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      renderGuides();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      currentQuery = searchInput.value.trim();
      renderGuides();
    });
  }

  renderGuides();
})();

// 打开攻略详情
function openGuide(id) {
  var guide = null;
  for (var i = 0; i < GUIDES.length; i++) {
    if (GUIDES[i].id === id) { guide = GUIDES[i]; break; }
  }
  if (!guide) return;

  var CAT_LABEL = {
    account: '港澳开户',
    card: '香港信用卡',
    refund: '付费服务'
  };

  function renderBlock(b) {
    switch (b.type) {
      case 'h2':
        return '<h2>' + b.text + '</h2>';
      case 'h3':
        return '<h3>' + b.text + '</h3>';
      case 'p':
        return '<p>' + b.text + '</p>';
      case 'ul':
        return '<ul>' + b.items.map(function (it) { return '<li>' + it + '</li>'; }).join('') + '</ul>';
      case 'ol':
        return '<ol>' + b.items.map(function (it) { return '<li>' + it + '</li>'; }).join('') + '</ol>';
      case 'tip':
        return '<div class="tip-box"><b>💡 实用 Tips：</b>' + b.text + '</div>';
      case 'warn':
        return '<div class="warn-box"><b>⚠️ 注意：</b>' + b.text + '</div>';
      case 'info':
        return '<div class="info-box"><b>ℹ️ 说明：</b>' + b.text + '</div>';
      case 'referral':
        return '<div class="referral-box"><div class="ref-title">' + (b.title || '🎁 我的推荐 / 邀请') + '</div><p>' + b.text + '</p><div class="ref-links">' + (b.links ? b.links.map(function(l){return '<a href="'+l.url+'" target="_blank" rel="noopener">'+l.label+'</a>';}).join('') : '<span class="ref-soon">邀请链接待更新</span>') + '</div></div>';
      case 'buy':
        return '<div class="buy-box"><a class="btn buy-btn" href="' + b.url + '" target="_blank" rel="noopener">💳 ' + b.text + '</a></div>';
      case 'table':
        var thead = '<thead><tr>' + b.head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead>';
        var tbody = '<tbody>' + b.rows.map(function (r) {
          return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
        }).join('') + '</tbody>';
        return '<div class="table-wrap"><table>' + thead + tbody + '</table></div>';
      default:
        return '';
    }
  }

  var tagHtml = (guide.tags || []).map(function (t) {
    return '<span class="tag-chip">' + t + '</span>';
  }).join('');
  var metaParts = ['分类：' + CAT_LABEL[guide.cat]];
  if (guide.updated) metaParts.push('更新：' + guide.updated);

  var html = '<section class="article-hero">'
    + '<div class="wrap">'
    + '<div class="cat">' + CAT_LABEL[guide.cat] + '</div>'
    + '<h1>' + guide.title + '</h1>'
    + '<div class="meta">' + metaParts.join(' · ') + '</div>'
    + (tagHtml ? '<div class="meta-tags">' + tagHtml + '</div>' : '')
    + '</div></section>'
    + '<div class="wrap">'
    + '<div class="article-body">'
    + '<a class="back-link" href="javascript:void(0)" onclick="showHome()">← 返回攻略列表</a>'
    + guide.content.map(renderBlock).join('')
    + '<div style="text-align:center;margin-top:48px">'
    + '<a class="btn" href="javascript:void(0)" onclick="showHome()">← 返回攻略列表</a>'
    + '</div></div></div>';

  document.body.innerHTML = html;
  window.scrollTo(0, 0);
}

function showHome() {
  location.reload();
}
