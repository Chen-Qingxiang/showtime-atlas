# 背景库受控词表

`background/manifest.json` 是背景库契约；`background/vocabulary.json` 是它的机器可读受控词表。本文件解释取值语义。新增 `tag` 或 `region` 必须先同时登记到 JSON 和本文件，再写入 Manifest；拼写近义但语义相同的值应复用已有词，不得临时造词。

## Manifest 必填字段

每层都必须有唯一的 `id`、面向用户的 `name`、以 `background/` 开头的相对 `file`，以及非空 `tags`、非空 `regions`、一个 `scale` 和一个 `density`。CSV 必须严格是 `time,title` 两列，可在数据前放 `#` 注释。

`tags` 表达主题，`regions` 表达空间倾向。二者可以有少量历史遗留重叠（例如 `china`、`global` 同时也是合法 tag），但新层应优先把空间信息写入 `regions`，只在地区本身也是研究主题时保留地区 tag。

## 推荐同义词

[`synonyms.json`](synonyms.json) 是推荐提词的机器可读别名表，键只能引用本受控词表中已经存在的 tag 或 region。推荐器会动态扫描项目名、主题、说明、图层名、事件标题及元数据，同时始终把受控值本身作为英文检索词；同义词文件只补充跨语言或常用异名。

维护原则：别名应描述一个可复用概念或地区，不写面向某个示例的个别人名；容易歧义的单字不登记；历史政体名称可以作为地区别名，但应覆盖同一地区的多个常用时期，避免单一朝代或国家造成偏置。仓库检查会拒绝未登记的键和非数组值。

## tags

以下分组只是阅读导航，不构成额外字段；唯一合法拼写以 `vocabulary.json` 为准。

- 尺度与通史：`ancient`、`big-history`、`deep-time`、`global`、`history`、`modern`、`period`、`scale`、`world-history`
- 区域与跨区域：`africa`、`americas`、`balkans`、`china`、`east-asia`、`egypt`、`eurasia`、`europe`、`india`、`inner-asia`、`iran`、`islam`、`japan`、`korea`、`middle-east`、`near-east`、`nomads`、`nordic`、`oceania`、`pacific`、`persia`、`russia`、`south-america`、`south-asia`、`southeast-asia`、`steppe`、`tibet`
- 政治、法律与冲突：`colonialism`、`conflict`、`decolonization`、`democracy`、`dynasty`、`empire`、`geopolitics`、`international`、`law`、`legal-code`、`nationalism`、`politics`、`regime`、`revolution`、`rights`、`state`、`war`
- 经济、劳动与交换：`capitalism`、`competition`、`currency`、`economic-thought`、`economy`、`finance`、`globalization`、`industry`、`labor`、`measurement`、`silk-road`、`trade`、`transport`、`welfare`
- 社会、人口与身份：`childhood`、`demography`、`family`、`gender`、`human`、`identity`、`indigenous`、`migration`、`population`、`social-movement`、`society`、`women`
- 思想、宗教与教育：`cognitive-science`、`culture`、`education`、`knowledge`、`language`、`logic`、`philosophy`、`psychology`、`religion`、`thought`、`translation`、`university`、`writing`
- 科学、数学与技术：`ai`、`astronomy`、`biology`、`cartography`、`chemistry`、`communication`、`computing`、`evolution`、`exploration`、`genetics`、`geography`、`geology`、`information`、`internet`、`life`、`materials`、`mathematics`、`medicine`、`network`、`physics`、`printing`、`public-health`、`science`、`space`、`space-race`、`technology`
- 环境、生计与灾害：`agriculture`、`climate`、`climate-change`、`conservation`、`cuisine`、`disaster`、`disease`、`domestication`、`earthquake`、`energy`、`environment`、`environmentalism`、`food`、`pandemic`、`urban`、`urbanization`、`city`
- 文学、艺术与日常生活：`architecture`、`art`、`clothing`、`fashion`、`film`、`literature`、`material-culture`、`media`、`music`、`painting`、`performance`、`ritual`、`sports`、`theatre`、`visual-media`

容易混淆的边界：`computing` 指计算理论与计算机器，`internet` 指联网基础设施；`media` 指媒介制度，`communication` / `network` 指通信系统；`disease` 指疾病背景，`pandemic` 指跨区域大流行；`law` 是法制主题，`legal-code` 专指成文法典；`climate` 是气候背景，`climate-change` 专指现代人为气候变化。

## regions

Region 是推荐时的软倾向，不是互斥领土断言。一层可登记多个区域；真正跨区域、无法合理归于一个宏区的层使用 `global`。

| 值 | 含义与使用边界 |
| --- | --- |
| `global` | 真正跨多个大区或以全球系统为对象；不要用来填补不确定性 |
| `africa` / `north-africa` | 非洲整体 / 北非；北非层可同时标 `middle-east` |
| `americas` / `south-america` | 美洲整体 / 南美洲专题 |
| `china` / `japan` / `korea` | 中国、日本、朝鲜半岛专题 |
| `south-asia` / `southeast-asia` | 南亚 / 东南亚 |
| `europe` / `northern-europe` / `eastern-europe` / `balkans` / `russia` | 欧洲整体与可比较的次区域；次区域层通常同时标 `europe` |
| `middle-east` / `iran` / `egypt` | 中东整体与伊朗、埃及专题；跨北非层可并列 `north-africa` |
| `eurasia` / `central-asia` / `inner-asia` / `tibet` | 欧亚跨区、中央亚细亚、内亚与藏区；边界重叠时允许多值 |
| `oceania` / `pacific` | 大洋洲陆地社会 / 太平洋岛屿与海洋网络，跨二者时并列 |

合法全集：`africa`、`americas`、`balkans`、`central-asia`、`china`、`eastern-europe`、`egypt`、`eurasia`、`europe`、`global`、`inner-asia`、`iran`、`japan`、`korea`、`middle-east`、`north-africa`、`northern-europe`、`oceania`、`pacific`、`russia`、`south-america`、`south-asia`、`southeast-asia`、`tibet`。

## scale

`scale` 描述这一层适合与哪一种时间跨度比较，不等同于某一行的时间精度。

| 值 | 标准 |
| --- | --- |
| `year` | 以人类历史年份和时期为主；即使跨度数千年，读者仍可在年—世纪尺度使用。 |
| `mixed` | 有意跨越显著不同的人类时间量级（如史前到当代），或同时包含年级阶段与少量日期级里程碑。 |
| `deep-time` | 主体在百万年至十亿年量级，只有在地质、生命或宇宙尺度上比较才有意义。不能因单个远古事件就标为此值。 |

## density

`density` 描述相对于覆盖跨度的研究颗粒，而不是画布像素密度。先看条目性质，再用行数作护栏：

| 值 | 分级标准 |
| --- | --- |
| `low` | 只给宏观时期或阈值骨架，通常 8–20 个有效事件；不混入次级里程碑。 |
| `medium` | 宏观阶段加少量跨领域里程碑，通常 15–40 个有效事件；这是背景库默认等级。 |
| `high` | 超过 40 个有效事件或接近专题细年表；背景库原则上不采用，确需使用时须在注释头解释理由并接受专项评审。 |

`low` 与 `medium` 的行数区间有意重叠：例如 16 行纯时代划分仍是 `low`，13 行同时包含王朝与制度节点可以是 `medium`。任何层超过 40 行都必须拆层或明确标 `high`；少于 8 行通常信息不足。无论等级，背景层都必须在 `#` 头中说明用途、来源框架，并声明“用于研究定位与比较，不是权威或完整年表”。
