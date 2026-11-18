// HTMLの部品を取り出す
const dateInput = document.getElementById("start-date");
const timeInput = document.getElementById("start-time");
const button = document.getElementById("calc-button");
const result = document.getElementById("result");

// 保存に使う名前
const STORAGE_KEY = "anniversary";

// 保存した記念日を読み出す（なければ null）
function loadAnniversary() {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (text === null) {
      return null;
    }
    const data = JSON.parse(text);
    if (typeof data.date === "string" && typeof data.time === "string") {
      return data;
    }
    return null;
  } catch (e) {
    return null; // 読めなかったときは、保存なしとして扱う
  }
}

// 記念日を保存する
function saveAnniversary(dateValue, timeValue) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: dateValue, time: timeValue })
    );
  } catch (e) {
    // 保存できなくても、計算と表示は続ける
  }
}

// 入力欄の値から、結果を計算して画面に出す
function showResult() {
  const dateValue = dateInput.value; // 例："2025-10-04"
  const timeValue = timeInput.value; // 例："15:00"

  // どちらかが空なら、メッセージを出して終了
  if (dateValue === "" || timeValue === "") {
    result.textContent = "日付と時刻を入力してください";
    return;
  }

  const start = makeStartDate(dateValue, timeValue);
  const now = new Date(); // テストのときは、ここを書き換える

  // 記念日が未来の日時のときは、計算も保存もしない
  if (start > now) {
    result.textContent = "記念日が未来の日時になっています";
    return;
  }

  // 正しい入力だったので、保存する
  saveAnniversary(dateValue, timeValue);

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

  result.innerHTML = html;
}

// ボタンが押されたら、計算して表示する
button.addEventListener("click", showResult);

// ページを開いたとき、保存した記念日があれば、入力欄に戻して自動で表示する
const saved = loadAnniversary();
if (saved !== null) {
  dateInput.value = saved.date;
  timeInput.value = saved.time;
  showResult();
}
