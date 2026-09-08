/* Google sign-in and private cross-device sync for My Food Diary. */
const SUPABASE_URL = 'https://qseicurjosmzwiqtflqr.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_FxCyxcEM0ImWyfla9bxQEQ_YKGSpDe1';
const cloud = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
let currentUser = null;
let syncTimer = null;
const accountButton = document.getElementById('accountButton');

const syncStyle = document.createElement('style');
syncStyle.textContent = `
  #accountButton { border: 1px solid var(--line); background: #fff; color: var(--ink); border-radius: 999px; padding: 8px 12px; font: inherit; font-size: 13px; cursor: pointer; white-space: nowrap; }
  #accountButton.signed-in { background: var(--accent-soft); }
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
  if (!currentUser) { accountButton.textContent = 'Google 登录'; accountButton.classList.remove('signed-in'); return; }
  accountButton.textContent = '已同步';
  accountButton.classList.add('signed-in');
}
function statePayload() { return { days, categories, foods, recipes }; }
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
  if (error) { console.warn('Could not load synced diary:', error.message); showSyncMessage('同步设置还未完成'); return; }
  if (!data) { await uploadCloudState(); showSyncMessage('已保存到云端'); return; }
  const saved = data.state || {};
  if (saved.days) days = saved.days;
  if (saved.categories) categories = saved.categories;
  if (saved.foods) foods = saved.foods;
  if (saved.recipes) recipes = saved.recipes;
  saveLocally();
  refreshAllViews();
  showSyncMessage('已同步你的记录');
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
