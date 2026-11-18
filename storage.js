// 保存に使う名前
const STORAGE_KEY_LIST = "anniversaries"; // 新しい保存（複数件）
const STORAGE_KEY_OLD = "anniversary";    // 前の保存（1件だけ）
const MAX_ANNIVERSARIES = 10;             // 登録できる最大の件数

// 保存した記念日の一覧を読み出す（まだ保存がなければ null）
function loadAnniversaries() {
  try {
    const text = localStorage.getItem(STORAGE_KEY_LIST);
    if (text === null) {
      return null;
    }
    const data = JSON.parse(text);
    if (!Array.isArray(data)) {
      return [];
    }
    // 形が正しいものだけを残す
    return data.filter(function (a) {
      return a &&
        typeof a.id === "string" &&
        typeof a.name === "string" &&
        typeof a.date === "string" &&
        typeof a.time === "string";
    });
  } catch (e) {
    return []; // 読めなかったときは、空として扱う
  }
}

// 記念日の一覧を、必ず配列で返す
function getAnniversaries() {
  const list = loadAnniversaries();
  return list === null ? [] : list;
}

// 記念日の一覧を保存する（成功したら true）
function saveAnniversaries(list) {
  try {
    localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(list));
    return true;
  } catch (e) {
    return false;
  }
}

// ほかの記念日と重ならない印（id）を作る
function makeId() {
  return String(Date.now()) + "-" + Math.floor(Math.random() * 1000000);
}

// 前の保存（1件だけ）を、新しい形に引き継ぐ。新しい保存がまだないときだけ行う
function migrateOldData() {
  try {
    if (localStorage.getItem(STORAGE_KEY_LIST) !== null) {
      return;
    }
    const oldText = localStorage.getItem(STORAGE_KEY_OLD);
    if (oldText === null) {
      return;
    }
    const old = JSON.parse(oldText);
    if (typeof old.date === "string" && typeof old.time === "string") {
      saveAnniversaries([
        { id: makeId(), name: "記念日", date: old.date, time: old.time }
      ]);
    }
  } catch (e) {
    // 引き継げなくても、そのまま続ける
  }
}

// 記念日を1件追加する（満杯のときは null を返す）
function addAnniversary(name, date, time) {
  const list = getAnniversaries();
  if (list.length >= MAX_ANNIVERSARIES) {
    return null;
  }
  const trimmed = name.trim().slice(0, 30);
  const finalName = trimmed === "" ? "記念日" + (list.length + 1) : trimmed;
  const item = { id: makeId(), name: finalName, date: date, time: time };
  list.push(item);
  saveAnniversaries(list);
  return item;
}

// 記念日を1件削除する
function removeAnniversary(id) {
  const list = getAnniversaries().filter(function (a) {
    return a.id !== id;
  });
  saveAnniversaries(list);
}
