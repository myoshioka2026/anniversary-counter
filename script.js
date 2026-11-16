// HTMLの部品を取り出す
const dateInput = document.getElementById("start-date");
const timeInput = document.getElementById("start-time");
const button = document.getElementById("calc-button");
const result = document.getElementById("result");

// ボタンが押されたときの処理
button.addEventListener("click", function () {
  const dateValue = dateInput.value; // 例："2025-10-04"
  const timeValue = timeInput.value; // 例："15:00"

  // どちらかが空なら、メッセージを出して終了
  if (dateValue === "" || timeValue === "") {
    result.textContent = "日付と時刻を入力してください";
    return;
  }

  const start = makeStartDate(dateValue, timeValue);
  const now = new Date(); // テストのときは、ここを書き換える（下の表を参照）

  // 記念日が未来の日時のときは、計算しない
  if (start > now) {
    result.textContent = "記念日が未来の日時になっています";
    return;
  }

  const units = getFixedUnits(start, now);
  const ymd = getYearMonthDay(start, now);

  result.textContent =
    "経過：" + ymd.years + "年" + ymd.months + "カ月" + ymd.days + "日" +
    "（現在値：" + ymd.years + "年、" + ymd.totalMonths + "カ月、" +
    units.days + "日、" + units.weeks + "週、" +
    units.hours + "時間、" + units.minutes + "分）";
});
