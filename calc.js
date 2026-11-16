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

// n が「キリの良い数」かどうかを判定する
// unit は "minute" "hour" "day" "week" "month" "year" のどれか
function isKiri(n, unit) {
  // 正の整数だけが対象
  if (!Number.isInteger(n) || n < 1) {
    return false;
  }

  // 年とカ月だけは、1〜9もキリの良い数にする
  if ((unit === "year" || unit === "month") && n <= 9) {
    return true;
  }

  const text = String(n); // 数を文字にして、並びを調べる

  // ① 1、または、先頭1桁のあとがすべて0（10、20、100、400、1000…）
  if (n === 1) {
    return true;
  }
  if (/^[1-9]0+$/.test(text)) {
    return true;
  }

  // ② 2桁以上のぞろ目（11、22、111…）
  if (/^([1-9])\1+$/.test(text)) {
    return true;
  }

  return false;
}

// 開始日時から n 単位たった日時（記念の日時）を求める
// unit は "minute" "hour" "day" "week" "month" "year" のどれか
function reachTime(start, unit, n) {
  const base = start.getTime(); // 開始日時をミリ秒にしたもの

  if (unit === "minute") {
    return new Date(base + n * 60 * 1000);
  }
  if (unit === "hour") {
    return new Date(base + n * 60 * 60 * 1000);
  }
  if (unit === "day") {
    return new Date(base + n * 24 * 60 * 60 * 1000);
  }
  if (unit === "week") {
    return new Date(base + n * 7 * 24 * 60 * 60 * 1000);
  }
  // カ月と年は、暦で数える（月末の丸めは addMonths がやってくれる）
  if (unit === "month") {
    return addMonths(start, n);
  }
  if (unit === "year") {
    return addMonths(start, n * 12);
  }
  return null; // 知らない単位が来たとき
}

// 日時を「2026/11/08 15:00」の形の文字にする（確認用・表示用）
function formatDateTime(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return y + "/" + m + "/" + d + " " + h + ":" + min;
}

// その日の0:00を返す
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0);
}

// at の時点での、その単位の現在値（切り捨て）を返す
function getUnitValue(unit, start, at) {
  if (at < start) {
    return 0; // 開始前は 0
  }
  if (unit === "year") {
    return getYearMonthDay(start, at).years;
  }
  if (unit === "month") {
    return getYearMonthDay(start, at).totalMonths;
  }
  const fixed = getFixedUnits(start, at);
  if (unit === "week") {
    return fixed.weeks;
  }
  if (unit === "day") {
    return fixed.days;
  }
  if (unit === "hour") {
    return fixed.hours;
  }
  return fixed.minutes; // "minute"
}

// ひとつの単位について、「お祝い」と「次のキリ」を調べる
function checkUnit(unit, start, now) {
  const todayStart = startOfDay(now);
  const tomorrowStart = new Date(
    todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() + 1, 0, 0
  );
  const LIMIT = 100000000; // 無限ループを防ぐための上限

  // ① 今日が記念の日時になるキリの良い数（お祝い）を全部集める
  const celebrations = [];
  let n = Math.max(getUnitValue(unit, start, todayStart), 1);
  while (n < LIMIT) {
    const t = reachTime(start, unit, n);
    if (t >= tomorrowStart) {
      break; // 明日以降になったので終わり
    }
    if (t >= todayStart && isKiri(n, unit)) {
      celebrations.push({ n: n, time: t });
    }
    n = n + 1;
  }

  // ② 記念の日時が明日以降になる、一番近いキリの良い数（次のキリ）を探す
  let next = null;
  let m = Math.max(getUnitValue(unit, start, tomorrowStart), 1);
  while (m < LIMIT) {
    if (isKiri(m, unit)) {
      const t = reachTime(start, unit, m);
      if (t >= tomorrowStart) {
        next = { n: m, time: t };
        break;
      }
    }
    m = m + 1;
  }

  return { unit: unit, celebrations: celebrations, next: next };
}

// 6つの単位をまとめて調べる（大きい単位から順）
function checkAllUnits(start, now) {
  const units = ["year", "month", "week", "day", "hour", "minute"];
  return units.map(function (unit) {
    return checkUnit(unit, start, now);
  });
}

const UNIT_ORDER = ["year", "month", "week", "day", "hour", "minute"];
const UNIT_LABEL = {
  year: "年", month: "カ月", week: "週", day: "日", hour: "時間", minute: "分"
};

// 今から target までの「あとどれだけか」を文字にする（上位2つの単位）
function formatRemaining(now, target) {
  const diff = target - now; // ミリ秒
  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  const days = Math.floor(diff / DAY);
  const hours = Math.floor((diff % DAY) / HOUR);
  const minutes = Math.floor((diff % HOUR) / MIN);
  if (days >= 1) {
    return "あと" + days.toLocaleString() + "日" + hours + "時間";
  }
  if (hours >= 1) {
    return "あと" + hours + "時間" + minutes + "分";
  }
  return "あと" + minutes + "分";
}

// 画面に出す内容（お祝い・次のキリ）をまとめる
function buildView(start, now) {
  const results = checkAllUnits(start, now);

  // お祝い：全単位を集めて、大きい単位を優先（同じ単位なら数が大きい順）で最大3件
  const all = [];
  results.forEach(function (r) {
    r.celebrations.forEach(function (c) {
      all.push({ unit: r.unit, n: c.n, time: c.time });
    });
  });
  all.sort(function (a, b) {
    const ua = UNIT_ORDER.indexOf(a.unit);
    const ub = UNIT_ORDER.indexOf(b.unit);
    if (ua !== ub) {
      return ua - ub;
    }
    return b.n - a.n;
  });
  const celebrations = all.slice(0, 3);
  // 表示の順番は、大きい単位から、同じ単位なら数が小さい順にそろえる
  celebrations.sort(function (a, b) {
    const ua = UNIT_ORDER.indexOf(a.unit);
    const ub = UNIT_ORDER.indexOf(b.unit);
    if (ua !== ub) {
      return ua - ub;
    }
    return a.n - b.n;
  });

  // 次のキリ：お祝いがない単位だけ
  const nextList = [];
  results.forEach(function (r) {
    if (r.celebrations.length === 0 && r.next !== null) {
      nextList.push({
        unit: r.unit,
        n: r.next.n,
        time: r.next.time,
        remaining: formatRemaining(now, r.next.time),
        isNearest: false
      });
    }
  });

  // 一番近いものに印をつける（同じ時刻のものは全部）
  if (nextList.length > 0) {
    const minTime = Math.min.apply(null, nextList.map(function (x) {
      return x.time.getTime();
    }));
    nextList.forEach(function (x) {
      x.isNearest = (x.time.getTime() === minTime);
    });
  }

  return { celebrations: celebrations, nextList: nextList };
}

