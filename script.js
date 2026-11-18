// HTMLの部品を取り出す
const addDetails = document.getElementById("add-details");
const nameInput = document.getElementById("new-name");
const dateInput = document.getElementById("new-date");
const timeInput = document.getElementById("new-time");
const addButton = document.getElementById("add-button");
const addMessage = document.getElementById("add-message");
const listArea = document.getElementById("list");

// HTMLに入れる文字を安全にする（< や & などを、ただの文字として表示させる）
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 記念日1件ぶんの、一覧のカードをつくる
function buildItemHtml(a, now) {
  const start = makeStartDate(a.date, a.time);
  let html = '<div class="item" data-id="' + escapeHtml(a.id) + '">';
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

  html += "</div>";
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

// ページを開いたとき：前の保存を引き継いで、一覧を出す
migrateOldData();
renderList();
