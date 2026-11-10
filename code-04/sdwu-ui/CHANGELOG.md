# CHANGELOG

本项目遵循[语义化版本](https://semver.org/lang/zh-CN/)。

## [2.0.0] - 2026-11-01

### Breaking

- `sd-tabs` 的 `change` 事件 detail 由 `{ index }` 改为 `{ current }`
  **迁移**：`e.detail.index` → `e.detail.current`
- `star-rating` 的外部样式类 `star-class` 更名为 `item-class`
  **迁移**：模板里 `star-class="xxx"` → `item-class="xxx"`

## [1.3.0] - 2026-10-20

### Added

- `sd-tab` 新增 `badge` 属性，支持数字徽标（超过 99 显示 `99+`）
- `sd-tabs` 新增下划线跟随动画

## [1.2.1] - 2026-10-08

### Fixed

- 修复 `sd-tabs` 的 `switchTo()` 能切到 `disabled` 项的问题
- 修复 `star-rating` 在 `readonly` 下仍触发 `change` 的问题

## [1.0.0] - 2026-09-25

首个版本：`sd-tabs` / `sd-tab` / `star-rating`。
