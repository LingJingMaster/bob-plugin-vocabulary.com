<br />
<h1>
<p align="center">
  <img src="https://cdn.vocabulary.com/images/header/logo-1wobq9i.png" alt="Logo" width="500">
  <br>bob-plugin-vocabulary.com
</h1>
<p align="center">
    <a href="https://bobtranslate.com"><img src="https://img.shields.io/badge/Bob-Website-brightgreen?logo=Safari" alt="Website" /></a>

</p>
<p align="center">
    基于 vocabulary.com 的英英词典Bob插件
    <br />
</p>
<p align="center">
  <a href="#关于">关于</a> •
  <a href="#如何使用">如何使用</a> •
  <a href="#编译打包">编译打包</a> •
    <a href="#todo">TODO</a>
</p>

<p align="center">

![example](./static/example.png)
</p>


## 关于
本版本基于 [Oops418/bob-plugin-vocabulary.com](https://github.com/Oops418/bob-plugin-vocabulary.com) 修改，保留原项目 MIT 许可证。插件名为 Vocabulary Enhanced，ID 为 `com.lingjing.vocabulary.translate`，可与原版并存。修复释义、发音及错误提示，并增加词典中的例句。当前版本需要联网，未启用自动更新。

Bob 是一款 macOS 平台的 翻译 和 OCR 软件

本插件基于 vocabulary.com 提供的英文单词的英文释义


## 如何使用
1. 安装 Bob 软件
2. 获取构建得到的 `.bobplugin` 文件（目前尚未发布 Release）
3. 双击安装
4. 选择偏好的发音来源
5. 在插件设置中选择是否显示补充解释和例句；两项默认显示。

## 编译打包
1. Bob文档 - [开发插件](https://bobtranslate.com/plugin/)
2. 运行 `npm install`，然后在根目录下执行 `node build.js` 自动打包为 bob 插件，打包路径为 `./release`

## TODO
1. 因为释义来源与发音来源不同，若使用有道发音，概率出现发音为空
