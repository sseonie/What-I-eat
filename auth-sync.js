/* Google sign-in and private cross-device sync for My Food Diary. */
const SUPABASE_URL = 'https://qseicurjosmzwiqtflqr.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_FxCyxcEM0ImWyfla9bxQEQ_YKGSpDe1';
const cloud = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
let currentUser = null;
let syncTimer = null;
const accountButton = document.getElementById('accountButton');

const syncStyle = document.createElement('style');
syncStyle.textContent = `
  #accountButton { border: 0; background: transparent; color: var(--muted); padding: 7px 0 7px 12px; font: inherit; font-size: 14px; cursor: pointer; white-space: nowrap; }
  #accountButton.signed-in { color: var(--ink); }
  #syncToast { position: fixed; left: 50%; bottom: 96px; transform: translateX(-50%) translateY(12px); background: var(--ink); color: #fff; border-radius: 999px; padding: 9px 14px; font-size: 13px; opacity: 0; pointer-events: none; transition: .2s; z-index: 20; }
  #syncToast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
`;
document.head.appendChild(syncStyle);
const toast = document.createElement('div');
toast.id = 'syncToast';
document.body.appendChild(toast);

function showSyncMessage(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showSyncMessage.timer);
  showSyncMessage.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}
function updateAccountButton() {
  if (!currentUser) { accountButton.textContent = '登录'; accountButton.classList.remove('signed-in'); return; }
  accountButton.textContent = 'Google';
  accountButton.classList.add('signed-in');
}
function statePayload() { return { days, categories, foods, recipes, importVersion: IMPORT_VERSION }; }
const IMPORT_VERSION = '2026-food-log-1';
const BULK_IMPORT = {"days":{"2026-08-01":{"snacks":"蛋糕"},"2026-08-03":{"snacks":"抹茶拿铁 bql"},"2026-08-04":{"snacks":"糖果、串"},"2026-08-05":{"snacks":"蛋糕"},"2026-08-06":{"snacks":"抹茶 gelato"},"2026-08-07":{"snacks":"糖果"},"2026-08-08":{"snacks":"糖果"},"2026-08-09":{"snacks":"巧克力"},"2026-08-10":{"breakfast":"2 鸡蛋燕麦"},"2026-08-11":{"breakfast":"红薯 + 鸡蛋"},"2026-08-12":{"breakfast":"牛油果鸡蛋吐司"},"2026-08-13":{"breakfast":"牛油果鸡蛋燕麦"},"2026-08-14":{"breakfast":"Ricotta 蓝莓吐司"},"2026-08-15":{"breakfast":"2 Crumpet"},"2026-08-16":{"breakfast":"红薯 + 鸡蛋"},"2026-08-17":{"breakfast":"2 鸡蛋燕麦"},"2026-08-18":{"breakfast":"Ricotta 蓝莓吐司"},"2026-08-19":{"breakfast":"2 Crumpet"},"2026-08-20":{"breakfast":"2 茶叶蛋 + 贝贝南瓜"},"2026-08-21":{"breakfast":"牛油果鸡蛋吐司"},"2026-08-22":{"breakfast":"2 鸡蛋燕麦"},"2026-08-23":{"breakfast":"贝果 + 鸡蛋"},"2026-08-24":{"breakfast":"红薯 * 鸡蛋"},"2026-08-25":{"breakfast":"酸奶碗 + 抹茶拿铁"},"2026-08-26":{"breakfast":"Brunch"},"2026-08-27":{"breakfast":"2 鸡蛋燕麦"},"2026-08-29":{"breakfast":"2 鸡蛋燕麦"},"2026-08-30":{"breakfast":"巴斯克"},"2026-08-31":{"breakfast":"黑松露滑蛋吐司"},"2026-09-01":{"breakfast":"鸡蛋燕麦"},"2026-09-02":{"breakfast":"贝果 + 鸡蛋"},"2026-09-03":{"breakfast":"鸡蛋燕麦"},"2026-09-04":{"breakfast":"酸奶碗"},"2026-09-05":{"breakfast":"2 鸡蛋 + 抹茶拿铁"},"2026-09-06":{"breakfast":"酸奶碗"},"2026-09-07":{"breakfast":"贝果 + 鸡蛋"},"2026-07-06":{"breakfast":"鸡蛋牛油果燕麦"},"2026-07-07":{"breakfast":"鸡蛋 + 水果"},"2026-07-08":{"breakfast":"鸡蛋牛油果三明治"},"2026-07-09":{"breakfast":"红薯 + 鸡蛋"},"2026-07-10":{"breakfast":"蓝莓酸奶鸡蛋燕麦"},"2026-07-11":{"breakfast":"红薯 + 鸡蛋"},"2026-07-12":{"breakfast":"鸡蛋牛油果燕麦"},"2026-07-13":{"breakfast":"鸡蛋 + 贝果"},"2026-07-14":{"breakfast":"满汉三明治 + 鸡蛋"},"2026-07-15":{"breakfast":"黑松露三明治 + 鸡蛋"},"2026-07-16":{"breakfast":"鸡蛋"},"2026-07-17":{"breakfast":"黑松露滑蛋吐司"},"2026-07-18":{"breakfast":"鸡蛋 + 贝果"},"2026-07-19":{"breakfast":"红薯 + 鸡蛋"},"2026-07-20":{"breakfast":"2 鸡蛋燕麦"},"2026-07-21":{"breakfast":"隔夜燕麦"},"2026-07-22":{"breakfast":"香蕉 + 蓝莓吐司"},"2026-07-23":{"breakfast":"牛油果鸡蛋吐司"},"2026-07-24":{"breakfast":"牛油果鸡蛋燕麦"},"2026-07-25":{"breakfast":"酸奶碗"},"2026-07-26":{"breakfast":"贝果 + 鸡蛋"},"2026-07-27":{"breakfast":"黑松露滑蛋吐司"},"2026-07-28":{"breakfast":"鸡蛋 + 水果"},"2026-07-29":{"breakfast":"酸奶碗"},"2026-07-30":{"breakfast":"Lungo（鸡肉蜂蜜芥末贝果）"},"2026-07-31":{"breakfast":"黑松露滑蛋吐司"},"2026-08-28":{"breakfast":"Starbucks 牛油果蛋白软包 + 美式"},"2026-09-09":{"breakfast":"黑松露鸡蛋三明治"}},"recipes":[{"name":"泡菜鸡胸肉炒饭","calories":"550","ingredients":"鸡胸肉 180g\n- 一勺生抽\n- 白胡椒\n- 一勺蚝油\n切块洋葱\n泡菜 80g\n米饭 120g\n紫菜 5g\n酱料\n- 一勺韩式辣酱\n- 一勺生抽\n- 一勺白糖","steps":"先煎熟鸡肉，再放入洋葱炒熟\n加入泡菜，翻炒均匀\n加入米饭，再加入酱料\n翻炒均匀就可以出锅啦！"},{"name":"鸡胸肉滑蛋拌饭","calories":"650","ingredients":"鸡胸肉 180g\n- 一勺生抽\n- 一勺老抽\n- 白胡椒\n条状洋葱 80g（半个）\n鸡蛋 2 个\n料汁\n- 两勺生抽\n- 一勺老抽\n- 一勺蚝油\n- 一点糖\n- 黑胡椒\n- 半碗清水","steps":""},{"name":"低卡原味巴斯克","calories":"300","ingredients":"玛莎奶油奶酪 100g（162 kcal）\n代糖 22.5g\n玉米淀粉 5g（20 kcal）\n全脂牛奶 60ml（39 kcal）\n鸡蛋 1 个（73 kcal）","steps":"烤箱：220 度，20 分钟"}]};
function applyBulkImport(saved) {
  if (saved.importVersion === IMPORT_VERSION) return false;
  Object.entries(BULK_IMPORT.days).forEach(([date, meals]) => { days[date] = { ...(days[date] || {}), ...meals }; });
  BULK_IMPORT.recipes.forEach(recipe => { if (!recipes.some(item => item.name === recipe.name)) recipes.push({ ...recipe, id: Date.now() + recipes.length }); });
  return true;
}

function refreshAllViews() { renderHome(); renderCalendar(); renderWeek(); renderFoods(); renderRecipes(); }

async function uploadCloudState() {
  if (!currentUser) return;
  const { error } = await cloud.from('food_diary_state').upsert({
    user_id: currentUser.id, state: statePayload(), updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' });
  if (error) console.warn('Could not sync diary:', error.message);
}
async function downloadCloudState() {
  if (!currentUser) return;
  const { data, error } = await cloud.from('food_diary_state').select('state').eq('user_id', currentUser.id).maybeSingle();
  if (error) { console.warn('Could not load synced diary:', error.message); const imported = applyBulkImport({}); saveLocally(); refreshAllViews(); showSyncMessage(imported ? '早餐、零食和食谱已导入' : '同步设置还未完成'); return; }
  const saved = (data && data.state) || {};
  if (saved.days) days = saved.days;
  if (saved.categories) categories = saved.categories;
  if (saved.foods) foods = saved.foods;
  if (saved.recipes) recipes = saved.recipes;
  const imported = applyBulkImport(saved);
  saveLocally();
  refreshAllViews();
  if (!data || imported) await uploadCloudState();
  showSyncMessage(imported ? '早餐、零食和食谱已导入' : '已同步你的记录');
}
function queueUpload() {
  if (!currentUser) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(uploadCloudState, 700);
}
const saveLocally = persist;
persist = function () { saveLocally(); queueUpload(); };

accountButton.addEventListener('click', async () => {
  if (currentUser) { await cloud.auth.signOut(); return; }
  const { error } = await cloud.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + window.location.pathname } });
  if (error) showSyncMessage('暂时无法打开 Google 登录');
});
cloud.auth.onAuthStateChange((event, session) => {
  currentUser = session ? session.user : null;
  updateAccountButton();
  if (event === 'SIGNED_IN') setTimeout(downloadCloudState, 0);
  if (event === 'SIGNED_OUT') showSyncMessage('已退出 Google 登录');
});
cloud.auth.getSession().then(({ data }) => {
  currentUser = data.session ? data.session.user : null;
  updateAccountButton();
  if (currentUser) downloadCloudState();
});
