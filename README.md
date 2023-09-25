# 历史时间线

# 特别说明
- 手动构建
```shell
# 安装依赖
npm install

# 构建安装包
npm run build
```

- 关于自动构建

git tag 会触发 Github Actions 的流水线生成 `release`，此时的 `release` 还是 `Draft` 标记，手动填写说明之后可以发布正式版。

git tag 标签格式定义(标准 tag 结构)： v\<x>.\<x>.\<x>

# 软件截图
![alt 截图1](./source/1.png)

- 处理 tl-attribution 标签(搜索源码删除)

# 变更
- 2023-09-25

通过 Github Actions 流水线自动打包产物，只打包了 `MacOS` 和 `Windows` 。


- 2023-09-13

根据 events.group 字段对时间轴上的事件进行了分类：政治、经济、科技、社会、文化、军事

# TODO
- 数据组织形式考虑一下其他方式
