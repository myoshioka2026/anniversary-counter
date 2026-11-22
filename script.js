// HTMLの部品を取り出す
const listView = document.getElementById("list-view");
const detailView = document.getElementById("detail-view");
const detailName = document.getElementById("detail-name");
const detailArea = document.getElementById("detail");
const addDetails = document.getElementById("add-details");
const nameInput = document.getElementById("new-name");
const dateInput = document.getElementById("new-date");
const timeInput = document.getElementById("new-time");
const addButton = document.getElementById("add-button");
const addMessage = document.getElementById("add-message");
const listArea = document.getElementById("list");
const deleteButton = document.getElementById("delete-button");

// いま詳細画面に出している記念日（削除のときに使う）
let currentItem = null;

// HTMLに入れる文字を安全にする（< や & などを、ただの文字として表示させる）
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------- 一覧画面 ----------

// 記念日1件ぶんの、一覧のカードをつくる（押すと詳細に移るリンク）
function buildItemHtml(a, now) {
  const start = makeStartDate(a.date, a.time);
  let html = '<a class="item" href="#a-' + escapeHtml(a.id) + '">';
  html += '<div class="item-name">💕 ' + escapeHtml(a.name) + "</div>";

  if (start > now) {
    html += '<div class="item-next">まだ先の記念日です（' + formatDateTime(start) + "から）</div>";
  } else {
    const ymd = getYearMonthDay(start, now);
    const view = buildView(start, now);

    html += '<div class="item-elapsed">' +
      ymd.years + "年" + ymd.months + "カ月" + ymd.days + "日</div>";

    // 今日がお祝いの日なら、目立つ表示を出す
    if (view.celebrations.length > 0) {
      const names = view.celebrations.map(function (c) {
        return c.n.toLocaleString() + UNIT_LABEL[c.unit];
      }).join("・");
      html += '<div class="item-celebrate">🎉 今日はお祝い！（' + names + "）</div>";
    }

    // 一番近い次のキリを、1つだけ出す
    const nearest = view.nextList.filter(function (x) {
      return x.isNearest;
    })[0];
    if (nearest) {
      html += '<div class="item-next">次：' + nearest.n.toLocaleString() +
        UNIT_LABEL[nearest.unit] + "まで　" + nearest.remaining + "</div>";
    }
  }

  html += "</a>";
  return html;
}

// 一覧を描き直す
function renderList() {
  const list = getAnniversaries();
  if (list.length === 0) {
    listArea.innerHTML =
      '<p class="empty">まだ記念日がありません。上の「＋ 記念日を追加する」から、はじめましょう 💕</p>';
    return;
  }
  const now = new Date();
  let html = "";
  list.forEach(function (a) {
    html += buildItemHtml(a, now);
  });
  listArea.innerHTML = html;
}

// ---------- 詳細画面 ----------

// 詳細画面の中身（経過・現在値・お祝い・次のキリ）をつくる
function buildDetailHtml(a, now) {
  const start = makeStartDate(a.date, a.time);

  if (start > now) {
    return "<p>まだ先の記念日です</p>";
  }

  const units = getFixedUnits(start, now);
  const ymd = getYearMonthDay(start, now);
  const view = buildView(start, now);

  let html = "";
  html += "<p>経過：" + ymd.years + "年" + ymd.months + "カ月" + ymd.days + "日</p>";
  html += "<p>現在値：" + ymd.years + "年、" + ymd.totalMonths + "カ月、" +
    units.days + "日、" + units.weeks + "週、" +
    units.hours + "時間、" + units.minutes + "分</p>";

  // お祝い
  if (view.celebrations.length > 0) {
    html += "<h2>💖 お祝い</h2><ul>";
    view.celebrations.forEach(function (c) {
      html += '<li class="celebrate">' + c.n.toLocaleString() + UNIT_LABEL[c.unit] +
        "（" + formatDateTime(c.time) + "）</li>";
    });
    html += "</ul>";
  }

  // 次のキリ（一番近いものを強調し、あとどれだけかも出す）
  if (view.nextList.length > 0) {
    html += "<h2>🌸 次のキリ</h2><ul>";
    view.nextList.forEach(function (x) {
      const cls = x.isNearest ? ' class="nearest"' : "";
      const mark = x.isNearest ? "💗 " : "";
      html += "<li" + cls + ">" + mark + x.n.toLocaleString() + UNIT_LABEL[x.unit] +
        "（" + formatDateTime(x.time) + "） " + x.remaining + "</li>";
    });
    html += "</ul>";
  }

  return html;
}

// ---------- 画面の切り替え ----------

// 一覧画面を出す
function showList() {
  detailView.hidden = true;
  listView.hidden = false;
  renderList();
}

// 詳細画面を出す
function showDetail(a) {
  currentItem = a;
  const start = makeStartDate(a.date, a.time);
  const now = new Date();
  detailName.innerHTML =
    '<div class="detail-title">💕 ' + escapeHtml(a.name) + "</div>" +
    '<div class="detail-sub">' + formatDateTime(start) + " から</div>";
  detailArea.innerHTML = buildDetailHtml(a, now);
  listView.hidden = true;
  detailView.hidden = false;
  window.scrollTo(0, 0);
}

// URLの # を見て、出す画面を決める（#a-id なら詳細、それ以外は一覧）
function route() {
  const hash = location.hash; // 例："#a-1700000000000-123456"
  if (hash.indexOf("#a-") === 0) {
    const id = hash.slice(3);
    const found = getAnniversaries().filter(function (a) {
      return a.id === id;
    })[0];
    if (found) {
      showDetail(found);
      return;
    }
  }
  showList();
}

// ---------- 追加 ----------

// 「追加する」ボタンが押されたとき
addButton.addEventListener("click", function () {
  const dateValue = dateInput.value;
  const timeValue = timeInput.value;

  // どちらかが空なら、メッセージを出して終了
  if (dateValue === "" || timeValue === "") {
    addMessage.textContent = "日付と時刻を入力してください";
    return;
  }

  // 記念日が未来の日時のときは、追加しない
  if (makeStartDate(dateValue, timeValue) > new Date()) {
    addMessage.textContent = "記念日が未来の日時になっています";
    return;
  }

  const item = addAnniversary(nameInput.value, dateValue, timeValue);
  if (item === null) {
    addMessage.textContent = "登録できるのは最大" + MAX_ANNIVERSARIES + "件までです";
    return;
  }

  // 入力欄を空に戻して、フォームを閉じ、一覧を描き直す
  nameInput.value = "";
  dateInput.value = "";
  timeInput.value = "";
  addMessage.textContent = "";
  addDetails.open = false;
  renderList();
});

// ---------- 削除 ----------

// 「削除する」ボタンが押されたとき
deleteButton.addEventListener("click", function () {
  if (currentItem === null) {
    return;
  }
  const ok = confirm("「" + currentItem.name + "」を削除しますか？\nこの操作は元に戻せません。");
  if (!ok) {
    return;
  }
  removeAnniversary(currentItem.id);
  currentItem = null;
  location.hash = "list"; // 一覧に戻る（#が変わるので、画面が自動で切り替わる）
});

// ---------- 開いたとき ----------

// URLの # が変わったら（カードを押す、戻るなど）、画面を切り替える
window.addEventListener("hashchange", route);

// 前の保存を引き継いで、最初の画面を出す
migrateOldData();
route();
