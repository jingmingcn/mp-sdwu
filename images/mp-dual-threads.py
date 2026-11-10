import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import matplotlib.font_manager as fm


# ============================================================
# 1. 中文字体设置
# ============================================================

def get_chinese_font():
    """自动寻找可用的中文字体"""
    fonts = [
        "Noto Sans CJK SC",
        "Noto Sans CJK JP",
        "Source Han Sans CN",
        "Microsoft YaHei",
        "SimHei",
        "PingFang SC",
        "WenQuanYi Zen Hei",
    ]

    available = {f.name for f in fm.fontManager.ttflist}

    for font in fonts:
        if font in available:
            return font

    return "DejaVu Sans"


FONT = get_chinese_font()

plt.rcParams["font.family"] = FONT
plt.rcParams["axes.unicode_minus"] = False


# ============================================================
# 2. 创建画布
# ============================================================

fig, ax = plt.subplots(figsize=(15, 9))

ax.set_xlim(0, 15)
ax.set_ylim(0, 9)
ax.axis("off")


# ============================================================
# 3. 通用绘图函数
# ============================================================

def draw_box(
    x,
    y,
    width,
    height,
    text,
    fontsize=12,
    linewidth=2,
):
    """绘制圆角矩形"""
    box = FancyBboxPatch(
        (x, y),
        width,
        height,
        boxstyle="round,pad=0.03,rounding_size=0.12",
        fill=False,
        linewidth=linewidth,
    )

    ax.add_patch(box)

    ax.text(
        x + width / 2,
        y + height / 2,
        text,
        ha="center",
        va="center",
        fontsize=fontsize,
    )

    return box


def draw_arrow(
    x1,
    y1,
    x2,
    y2,
    text=None,
    text_offset=(0, 0.15),
    rad=0,
):
    """绘制箭头"""
    arrow = FancyArrowPatch(
        (x1, y1),
        (x2, y2),
        arrowstyle="-|>",
        mutation_scale=16,
        linewidth=1.8,
        connectionstyle=f"arc3,rad={rad}",
    )

    ax.add_patch(arrow)

    if text:
        ax.text(
            (x1 + x2) / 2 + text_offset[0],
            (y1 + y2) / 2 + text_offset[1],
            text,
            ha="center",
            va="center",
            fontsize=10,
        )


def draw_container(
    x,
    y,
    width,
    height,
    title,
    title_size=14,
):
    """绘制一个大的模块容器"""
    box = FancyBboxPatch(
        (x, y),
        width,
        height,
        boxstyle="round,pad=0.03,rounding_size=0.15",
        fill=False,
        linewidth=2,
    )

    ax.add_patch(box)

    ax.text(
        x + 0.25,
        y + height - 0.35,
        title,
        ha="left",
        va="center",
        fontsize=title_size,
        fontweight="bold",
    )

    return box


# ============================================================
# 4. 标题
# ============================================================

ax.text(
    7.5,
    8.55,
    "微信小程序双线程架构",
    ha="center",
    va="center",
    fontsize=22,
    fontweight="bold",
)


# ============================================================
# 5. 微信小程序运行环境
# ============================================================

draw_container(
    0.5,
    0.5,
    14,
    7.5,
    "微信小程序运行环境",
    15,
)


# ============================================================
# 6. 逻辑层 / AppService
# ============================================================

draw_container(
    1.0,
    4.25,
    5.0,
    2.6,
    "逻辑线程 · AppService",
)

draw_box(
    1.4,
    5.15,
    1.45,
    0.7,
    "JavaScript",
)

draw_box(
    3.15,
    5.15,
    1.45,
    0.7,
    "App / Page",
)

draw_box(
    4.9,
    5.15,
    0.7,
    0.7,
    "状态",
    fontsize=11,
)

draw_box(
    2.0,
    4.5,
    3.0,
    0.45,
    "业务逻辑 / wx.* API",
    fontsize=10,
)


# ============================================================
# 7. Native 层
# ============================================================

draw_container(
    6.35,
    3.7,
    2.3,
    3.15,
    "Native",
)

draw_box(
    6.75,
    5.45,
    1.5,
    0.7,
    "JSBridge",
)

draw_box(
    6.75,
    4.35,
    1.5,
    0.7,
    "系统能力",
)

draw_box(
    6.75,
    3.85,
    1.5,
    0.35,
    "WebView",
    fontsize=10,
)


# ============================================================
# 8. 渲染层 / View
# ============================================================

draw_container(
    9.0,
    4.25,
    5.0,
    2.6,
    "渲染线程 · View",
)

draw_box(
    9.4,
    5.15,
    1.05,
    0.7,
    "WXML",
)

draw_box(
    10.75,
    5.15,
    1.05,
    0.7,
    "WXSS",
)

draw_box(
    12.1,
    5.15,
    1.1,
    0.7,
    "View",
)

draw_box(
    10.2,
    4.5,
    2.8,
    0.45,
    "页面渲染 / UI",
    fontsize=10,
)


# ============================================================
# 9. 用户
# ============================================================

draw_box(
    5.7,
    1.35,
    3.0,
    0.8,
    "用户操作",
    fontsize=13,
)


# ============================================================
# 10. 逻辑层 → Native
# ============================================================

draw_arrow(
    5.65,
    5.35,
    6.75,
    5.75,
    "setData / 数据",
    text_offset=(0, 0.18),
)


# ============================================================
# 11. Native → 渲染层
# ============================================================

draw_arrow(
    8.25,
    5.75,
    9.4,
    5.45,
    "数据更新",
    text_offset=(0, 0.18),
)


# ============================================================
# 12. 渲染层 → Native：事件
# ============================================================

draw_arrow(
    9.4,
    5.15,
    8.25,
    5.45,
    "用户事件",
    text_offset=(0, -0.15),
)


# ============================================================
# 13. Native → 逻辑层：事件回调
# ============================================================

draw_arrow(
    6.75,
    5.1,
    5.65,
    5.05,
    "事件回调",
    text_offset=(0, -0.18),
)


# ============================================================
# 14. wx API → Native
# ============================================================

draw_arrow(
    5.0,
    4.7,
    6.75,
    4.65,
    "wx.* API",
    text_offset=(0, 0.18),
)


# ============================================================
# 15. Native → 系统能力
# ============================================================

draw_arrow(
    7.5,
    4.35,
    7.5,
    2.85,
    "调用系统能力",
    text_offset=(0.8, 0),
)


draw_box(
    5.3,
    2.15,
    4.4,
    0.55,
    "网络 / 文件 / 相机 / 定位 / 蓝牙",
    fontsize=10,
)


# ============================================================
# 16. 用户操作 → View
# ============================================================

draw_arrow(
    8.0,
    1.75,
    12.5,
    4.95,
    "点击 / 输入 / 滚动",
    text_offset=(0.2, 0.15),
    rad=-0.08,
)


# ============================================================
# 17. 底部说明
# ============================================================

ax.text(
    7.5,
    0.85,
    "核心：逻辑线程与渲染线程相互独立，通过 Native / JSBridge 进行数据与事件通信",
    ha="center",
    va="center",
    fontsize=11,
)


# ============================================================
# 18. 保存图片
# ============================================================

output_file = "wechat_miniprogram_dual_thread_architecture.png"

plt.tight_layout()

plt.savefig(
    output_file,
    dpi=200,
    bbox_inches="tight",
)

plt.show()

print(f"图片已保存：{output_file}")