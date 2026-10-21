<div align="center">
  <img src="web/assets/logo.png" width="96" alt="胡堂主的硬件簿 Logo">
  <h1>胡堂主的硬件簿</h1>
  <p>快捷查看你的设备信息</p>
  <p><a href="https://davidlwb.github.io/HutaoDeviceCheck/">在线访问 GitHub Pages</a></p>
</div>

## 简介

胡堂主的硬件簿是一个纯前端、在浏览器本地运行的设备信息检测工具。它会根据操作系统与触控特征自动进入电脑端或手机 / 平板检测页面，并把浏览器能够真实读取到的信息按分类展示，适合查看本机配置、导出报告以及在远程协助前核对信息。

站点不依赖后端服务，检测数据不会上传到服务器。公网 IP 查询需要你主动点击，并会向第三方 IP 接口发送当前网络请求。

## 功能

- 自动识别电脑、手机与平板，并提供手动切换入口
- 浏览器内核、UA-CH、系统、架构、逻辑处理器与内存信息
- 屏幕物理分辨率估算（逻辑分辨率 × DPR 后近似取整）、DPI、方向、色域、HDR、刷新率实测
- HDR 能力检测与 AVIF + SVG 蒙版激发动画、16 级亮度阶梯、Display-P3 宽色域对比
- GPU 型号、厂商、WebGL / WebGPU 能力
- 网络状态、存储配额、媒体设备与编解码能力
- 主动查询公网 IP、IP 归属地、运营商 / 机构与 ASN（第三方接口，结果不写入报告）
- 摄像头 / 麦克风设备标签与多屏详情的按需授权，可在关于页逐项查看状态并单独申请
- 设备报告 JSON 导出、导入与远程协助摘要复制
- 胡桃 Live2D 角色：电脑端停靠侧边栏底部，手机端位于左下角
- 胡桃主题鼠标指针与自动 / 手动深浅色主题
- 只展示浏览器实际可获取或可合理推断的数据

## 在线访问

GitHub Pages：<https://davidlwb.github.io/HutaoDeviceCheck/>

## 本地运行

页面包含 Live2D 模型和 JSON 资源，需要通过 HTTP 静态服务器打开，不能直接双击 `index.html` 使用 `file://` 协议。

Node.js 环境：

```bash
npx serve web
```

或使用任意静态文件服务器，将站点根目录指向 `web/`。

## 目录结构

```text
.
├─ web/                         # 站点源码，也是 GitHub Pages 发布目录
│  ├─ index.html                # 按设备类型自动跳转
│  ├─ desktop.html              # 电脑端检测页
│  ├─ mobile.html               # 手机 / 平板检测页
│  ├─ about.html                # 关于、版本与隐私说明
│  └─ assets/                   # 样式、脚本、图标、Live2D 与指针资源
├─ .github/workflows/pages.yml  # GitHub Pages 自动部署工作流
└─ README.md
```

`dist/` 是用于其他预览环境的本地构建副本，不属于 GitHub Pages 的发布源。修改站点时请以 `web/` 为准。

## 更新与部署

1. 修改 `web/` 下的文件。
2. 提交并推送到 `main` 分支：

```bash
git add web README.md .github
git commit -m "Update device inspector"
git push origin main
```

3. GitHub Actions 会自动把 `web/` 发布到 GitHub Pages。之后每次推送 `main` 都会自动更新线上站点。

首次使用本仓库时，如果 Actions 提示 GitHub Pages 尚未启用，请在仓库的 **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**，然后重新运行工作流。

## 数据与隐私

- 所有检测与报告解析都在当前浏览器内完成，不会上传检测结果。
- 公网 IP 查询由你主动触发，会向 ipwho.is 发送当前网络请求；查询结果只用于当前页面，不写入报告。
- 摄像头、麦克风和多屏详情属于浏览器需要授权的增强能力；拒绝授权只影响对应项目。
- 浏览器无法获取或无法可靠推断的数据会被省略，不使用虚构值代替。
- 导出的报告可能包含设备型号、系统版本、屏幕规格、GPU 与浏览器标识，分享前请自行确认内容。

## 致谢与联系

Produced by **Davlike** · QQ **536511760**

本项目本地打包使用的开源组件：

- [PixiJS](https://pixijs.com/)
- Live2D Cubism SDK
- [pixi-live2d-display](https://github.com/guansss/pixi-live2d-display)

系统图标来自 Simple Icons、SVG Logos 与 Material Symbols。胡桃角色及相关美术素材版权归原权利方所有。

HDR 激发测试采用本地 HDR AVIF 图像与 SVG 蒙版方案，实现方式与测试图像参考 [Mintimate 在线工具箱的 displayHDR](https://tool.mintimate.cn/displayHDR)。
