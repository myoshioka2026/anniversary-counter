// 記念日の日付と時刻から、開始日時（Date）を作る
function makeStartDate(dateValue, timeValue) {
  // dateValue は "2025-10-04"、timeValue は "15:00" のような文字列
  return new Date(dateValue + "T" + timeValue);
}

// 開始日時から今までの経過を、分・時間・日・週で数える（切り捨て）
function getFixedUnits(start, now) {
  const diffMs = now - start; // 差をミリ秒で出す
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  return { minutes: minutes, hours: hours, days: days, weeks: weeks };
}

// 開始日時に n カ月を足した日時を作る（存在しない日付は月末に丸める）
function addMonths(start, n) {
  const year = start.getFullYear();
  const month = start.getMonth() + n; // getMonth() は 0〜11
  const day = start.getDate();
  // 足したあとの月の末日を求める（翌月の0日 ＝ 当月の末日）
  const lastDay = new Date(year, month + 1, 0).getDate();
  const realDay = Math.min(day, lastDay);
  return new Date(year, month, realDay, start.getHours(), start.getMinutes());
}

// 開始日時から今までの経過を、年・カ月・日で数える
function getYearMonthDay(start, now) {
  // 今を超えない最大のカ月数を探す
  let totalMonths = 0;
  while (addMonths(start, totalMonths + 1) <= now) {
    totalMonths = totalMonths + 1;
  }
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  // 残りの時間を日に直す（切り捨て）
  const rest = now - addMonths(start, totalMonths);
  const days = Math.floor(rest / (1000 * 60 * 60 * 24));
  return { years: years, months: months, days: days, totalMonths: totalMonths };
}
