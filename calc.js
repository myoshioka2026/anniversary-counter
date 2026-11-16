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
