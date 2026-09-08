# 食日记

这是一个可部署到 GitHub Pages 的手机网页应用。

1. 新建一个 GitHub repository。
2. 上传此文件夹中的全部文件。
3. 在 repository 的 Settings → Pages 中，选择从 main 分支部署。
4. 用手机 Safari 或 Chrome 打开生成的网址，然后选择“添加到主屏幕”。

添加后，主屏幕会显示手绘早餐图标。

## Google 登录与跨设备同步

这个版本已接入你提供的 Supabase 项目。完成下面一次性设置后，电脑和手机使用同一个 Google 账号登录，就会同步饮食记录、食物库和食谱。

1. 在 Supabase 打开 **SQL Editor**，新建查询，复制并运行同文件夹里的 `supabase-setup.sql`。
2. 打开 **Authentication → Providers → Google**，启用 Google。按页面提示填入自己的 Google OAuth Client ID 和 Client Secret，并在 Google Cloud 中加入 Supabase 提供的回调网址。
3. 打开 **Authentication → URL Configuration**：将 GitHub Pages 网址填入 **Site URL**，并把同一个完整网址加入 **Redirect URLs**。例如 `https://你的用户名.github.io/仓库名/`。
4. 将这个文件夹的内容上传至 GitHub，启用 GitHub Pages。打开网站后点击右上角的「Google 登录」。

首次登录会把当前设备的本地记录上传；之后同一账号在另一台设备登录时会下载相同记录。
