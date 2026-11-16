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

  // 読み取った値をそのまま表示する
  result.textContent = "記念日：" + dateValue + " " + timeValue;
});
