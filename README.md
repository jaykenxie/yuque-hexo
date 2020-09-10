# quexo
A downloader for articles from yuque（语雀知识库同步到hexo工具）

## Premise

事先拥有一个 [hexo](https://github.com/hexojs/hexo) 项目，并在 `package.json` 中配置相关信息，可参考 [例子](#Example)。

## Config

### 配置 TOKEN
处于对安全性的考虑，在使用第三方API访问知识库和COS时需要将token传入环境变量
语雀token获取方式：在语雀上点击 个人头像 -> 设置 -> Token 即可获取。传入 YUQUE_TOKEN 到 quexo 的进程有两种方式：
腾讯云: 控制台 -> 对象存储 -> 密钥管理 -> 点击 「云 API 密钥」获取

#### 设置全局的环境变量
- 命令执行时传入环境变量
  - mac / linux: `YUQUE_TOKEN=xxx COS_SECRETID=xxx COS_SECRETKEY=xxx quexo sync`
  - windows: `set YUQUE_TOKEN=xxx YUQUE_TOKEN=xxx COS_SECRETID=xxx COS_SECRETKEY=xxx && quexo sync`

### 配置知识库

> quexo.config.js

```javascript
module.exports = {
  login: "jianjunxie",
  repo: "kb",
  mdNameFormat: "title",
  postPath: "source/_posts/yq",
  imageLocalPath: "source/images/post",
  saveImage: "cos",
  cos: {
    bucket: "桶名",
    region: "地域",
    prefix: "post/",
    url: "桶的访url",
  },
};

```

| 参数名        | 含义                                 | 默认值               |
| ------------- | ------------------------------------ | -------------------- |
| postPath      | 文档同步后生成的路径                 | source/\_posts/yuque |
| cachePath     | 文档下载缓存文件                     | yuque.json           |
| mdNameFormat  | 文件名命名方式 (title / slug)        | title                |
| adapter       | 文档生成格式 (hexo/markdown)         | hexo                 |
| concurrency   | 下载文章并发数                       | 5                    |
| baseUrl       | 语雀 API 地址                        | -                    |
| login         | 语雀 login (group), 也称为个人路径   | -                    |
| repo          | 语雀仓库短名称，也称为语雀知识库路径 | -                    |
| onlyPublished | 只展示已经发布的文章                 | false                |
| onlyPublic    | 只展示公开文章                       | false                |
| saveImage     | 是否将图片保存到指定位置              | 可选值：undefined/cos/local，默认undefined   |
| imageLocalPath     | 保存本地图片路径                     | source/images        |
| cos     | 保存图片到腾讯云COS                     | undefined        |

> slug 是语雀的永久链接名，一般是几个随机字母。

## Install

```bash
npm i -g quexo
# or
npm i --save-dev quexo
```

## Sync

```
quexo sync
```

## Clean

```
quexo clean
```

## Npm Scripts

```json
{
  "sync": "quexo sync",
  "clean:yuque": "quexo clean"
}
```

## Debug

```
DEBUG=quexo.* quexo sync
```

## Best practice

- [Hexo 博客终极玩法：云端写作，自动部署](https://www.yuque.com/u46795/blog/dlloc7)
- [Hexo：语雀云端写作 Github Actions 持续集成](https://www.zhwei.cn/hexo-github-actions-yuque/)


# Notice

- 语雀同步过来的文章会生成两部分文件；

  - yuque.json: 从语雀 API 拉取的数据
  - source/\_posts/yuque/\*.md: 生成的 md 文件

- 支持配置 front-matter, 语雀编辑器编写示例如下:

  - 语雀编辑器示例，可参考[原文](https://www.yuque.com/u46795/blog/dlloc7)

  ```markdown
  tags: [hexo, node]
  categories: [fe]
  cover: https://cdn.nlark.com/yuque/0/2019/jpeg/155457/1546857679810-d82e3d46-e960-419c-a715-0a82c48a2fd6.jpeg#align=left&display=inline&height=225&name=image.jpeg&originHeight=225&originWidth=225&size=6267&width=225

  ---

  some description

  <!-- more -->

  more detail
  ```

- 如果遇到上传到语雀的图片无法加载的问题，可以参考这个处理方式 [#41](https://github.com/x-cold/quexo/issues/41)

# Example

- yuque to hexo: [jianjunx/jianjun-fun](https://github.com/jianjunx/jianjun-fun/blob/master/package.json)

# Changelog

### v1.7.0

- 🔥 增加文件上传至腾讯云

### v1.6.8

- 🔥 支持从文章中提取分类和标签
- 在文档中任意位置添加格式： [: $分类, #标签1, #标签2 :]

### v1.6.7

- 🔥 添加是否保存文档图片到本地设置

### v1.6.5

- 🔥 支持过滤 public 文章
- 🔥 生成的 markdown 自动格式化
- 🔥 移除去除语雀的锚点

### v1.6.4

- 🐸 修复多行 <br /> 的[问题](https://github.com/x-cold/quexo/pull/59)

### v1.6.3

- 🔥 支持嵌套的 categories 解析 #56
- 🐸 使用 [filenamify](https://github.com/sindresorhus/filenamify) 修复因为特殊字符的标题，生成非法的文件名导致的程序错误

### v1.6.2

- 🔥 使用 slug 自定义 [urlname](https://github.com/x-cold/quexo/pull/37)

### v1.6.1

- 🐸 修复 tags 格式化[问题](https://github.com/x-cold/quexo/issues/31)

### v1.6.0

- 🐸 修复 descrption 导致的 front-matter 解析错误[问题](https://github.com/x-cold/quexo/issues/27#issuecomment-490138318)
- 🔥 支持私有仓库同步
- 🔥 使用语雀官方的 SDK，支持 YUQUE_TOKEN，可以解除 API 调用次数限制

### v1.5.0

- 支持自定义 front-matter

### v1.4.3

- 支持过滤未发布文章 `onlyPublished`

### v1.4.2

- 支持纯 markdown 导出
- 支持请求并发数量参数 `concurrency`

### v1.4.0

- 升级项目架构，增强扩展性，支持自定义 adpter

### v1.3.1

- 修复 front-matter 处理格式问题

### v1.2.1

- 修复 windows 环境下命令行报错的问题
- 支持自定义文件夹和博客文件命名

### v1.1.1

- 支持 hexo-front-matter，可以在文章中编辑 tags / date 等属性

感谢[yuque-hexo](https://github.com/x-cold/yuque-hexo)本项目在其基础上修改和添加功能
