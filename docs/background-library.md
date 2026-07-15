# 背景库覆盖地图

本文是 `background/manifest.json` 的研究覆盖地图，不是第二份 Manifest。机器契约与合法元数据见 [`background/vocabulary.json`](../background/vocabulary.json)，取值说明见 [`background/VOCABULARY.md`](../background/VOCABULARY.md)。

背景层的目标是为专题研究提供低密度方向感：通常 15–40 条宏观时期、思潮或里程碑。所有层都用于研究定位与比较，不是权威或完整年表；层之间的重叠是有意的，因为比较对象不同。

## 任务 A 基线：原有 40 层

下表固定记录扩库前的 40 层基线。学科是本地图用于发现空白的主分类，不进入 Manifest；区域、尺度、密度与有效事件数来自 Manifest 和 CSV 审计。多区域层只在此清单出现一次，在后面的区域矩阵可出现多次。

| # | id | 主学科 | regions | scale | density | 有效事件 |
| ---: | --- | --- | --- | --- | --- | ---: |
| 1 | `big-history-thresholds` | 综合 / 大历史 | global | deep-time | low | 11 |
| 2 | `geology-life` | 地球、生命与环境 | global | deep-time | medium | 19 |
| 3 | `human-migration-population` | 人口、生计与社会 | global | mixed | medium | 15 |
| 4 | `agriculture-domestication` | 人口、生计与社会 | global | mixed | medium | 15 |
| 5 | `climate-environment` | 地球、生命与环境 | global | mixed | medium | 14 |
| 6 | `ap-world-periods` | 综合 / 大历史 | global | year | low | 9 |
| 7 | `world-empires` | 政治、制度与冲突 | global | year | medium | 22 |
| 8 | `major-wars` | 政治、制度与冲突 | global | mixed | medium | 18 |
| 9 | `china-dynasties` | 区域通史 | china | year | medium | 27 |
| 10 | `europe-periods` | 区域通史 | europe | year | low | 16 |
| 11 | `islamic-world` | 区域通史 | middle-east, north-africa | year | medium | 13 |
| 12 | `south-asia-history` | 区域通史 | south-asia | year | medium | 13 |
| 13 | `japan-periods` | 区域通史 | japan | year | medium | 15 |
| 14 | `korea-history` | 区域通史 | korea | mixed | medium | 12 |
| 15 | `southeast-asia-history` | 区域通史 | southeast-asia | year | medium | 13 |
| 16 | `africa-kingdoms-colonialism` | 区域通史 | africa | year | medium | 13 |
| 17 | `americas-civilizations-colonialism` | 区域通史 | americas | mixed | medium | 15 |
| 18 | `eurasian-steppe-nomads` | 区域通史 | eurasia | year | medium | 12 |
| 19 | `ancient-near-east-egypt` | 区域通史 | middle-east, egypt | year | medium | 13 |
| 20 | `oceania-pacific-world` | 区域通史 | oceania, pacific | mixed | medium | 11 |
| 21 | `thought-movements` | 思想与宗教 | global, europe, china | year | medium | 20 |
| 22 | `religion-history` | 思想与宗教 | global | mixed | medium | 13 |
| 23 | `literature-art` | 文学、艺术与文化 | global, europe, china | year | medium | 13 |
| 24 | `education-knowledge-institutions` | 教育、知识与媒介 | global | mixed | medium | 15 |
| 25 | `media-information` | 教育、知识与媒介 | global | mixed | medium | 16 |
| 26 | `language-translation` | 教育、知识与媒介 | global | year | medium | 12 |
| 27 | `science-technology` | 科学、技术与医学 | global | year | medium | 16 |
| 28 | `medicine-public-health` | 科学、技术与医学 | global | mixed | medium | 16 |
| 29 | `astronomy-space` | 科学、技术与医学 | global | mixed | medium | 16 |
| 30 | `trade-networks` | 经济、贸易与金融 | global | mixed | medium | 14 |
| 31 | `economy-society` | 经济、贸易与金融 | global | mixed | medium | 12 |
| 32 | `capitalism-finance` | 经济、贸易与金融 | global | mixed | medium | 15 |
| 33 | `transport-spatial-compression` | 聚落、交通与能源 | global | mixed | medium | 15 |
| 34 | `energy-history` | 聚落、交通与能源 | global | mixed | medium | 13 |
| 35 | `urbanization-city-form` | 聚落、交通与能源 | global | mixed | medium | 14 |
| 36 | `colonialism-decolonization` | 政治、制度与冲突 | global | year | medium | 14 |
| 37 | `political-revolutions` | 政治、制度与冲突 | global | mixed | medium | 15 |
| 38 | `democratization-regimes` | 政治、制度与冲突 | global | mixed | medium | 14 |
| 39 | `law-human-rights` | 政治、制度与冲突 | global | mixed | medium | 14 |
| 40 | `labor-social-movements-gender` | 人口、生计与社会 | global | mixed | medium | 15 |

### 学科 × 尺度矩阵（40 层基线）

`**— 空白**` 表示基线没有独立层，不表示该主题从未在别层出现。

| 学科 | deep-time | year | mixed |
| --- | --- | --- | --- |
| 综合 / 大历史 | `big-history-thresholds` | `ap-world-periods` | **— 空白** |
| 地球、生命与环境 | `geology-life` | **— 空白** | `climate-environment` |
| 人口、生计与社会 | **— 空白** | **— 空白** | `human-migration-population`<br>`agriculture-domestication`<br>`labor-social-movements-gender` |
| 政治、制度与冲突 | **— 空白** | `world-empires`<br>`colonialism-decolonization` | `major-wars`<br>`political-revolutions`<br>`democratization-regimes`<br>`law-human-rights` |
| 区域通史 | **— 空白** | `china-dynasties`<br>`europe-periods`<br>`islamic-world`<br>`south-asia-history`<br>`japan-periods`<br>`southeast-asia-history`<br>`africa-kingdoms-colonialism`<br>`eurasian-steppe-nomads`<br>`ancient-near-east-egypt` | `korea-history`<br>`americas-civilizations-colonialism`<br>`oceania-pacific-world` |
| 思想与宗教 | **— 空白** | `thought-movements` | `religion-history` |
| 文学、艺术与文化 | **— 空白** | `literature-art` | **— 空白** |
| 教育、知识与媒介 | **— 空白** | `language-translation` | `education-knowledge-institutions`<br>`media-information` |
| 科学、技术与医学 | **— 空白** | `science-technology` | `medicine-public-health`<br>`astronomy-space` |
| 经济、贸易与金融 | **— 空白** | **— 空白** | `trade-networks`<br>`economy-society`<br>`capitalism-finance` |
| 聚落、交通与能源 | **— 空白** | **— 空白** | `transport-spatial-compression`<br>`energy-history`<br>`urbanization-city-form` |

### 区域 × 尺度矩阵（40 层基线）

| region | deep-time | year | mixed |
| --- | --- | --- | --- |
| africa | **— 空白** | `africa-kingdoms-colonialism` | **— 空白** |
| americas | **— 空白** | **— 空白** | `americas-civilizations-colonialism` |
| china | **— 空白** | `china-dynasties`<br>`thought-movements`<br>`literature-art` | **— 空白** |
| egypt | **— 空白** | `ancient-near-east-egypt` | **— 空白** |
| eurasia | **— 空白** | `eurasian-steppe-nomads` | **— 空白** |
| europe | **— 空白** | `europe-periods`<br>`thought-movements`<br>`literature-art` | **— 空白** |
| global | `big-history-thresholds`<br>`geology-life` | `ap-world-periods`<br>`world-empires`<br>`thought-movements`<br>`literature-art`<br>`language-translation`<br>`science-technology`<br>`colonialism-decolonization` | `human-migration-population`<br>`agriculture-domestication`<br>`climate-environment`<br>`major-wars`<br>`religion-history`<br>`education-knowledge-institutions`<br>`media-information`<br>`medicine-public-health`<br>`astronomy-space`<br>`trade-networks`<br>`economy-society`<br>`capitalism-finance`<br>`transport-spatial-compression`<br>`energy-history`<br>`urbanization-city-form`<br>`political-revolutions`<br>`democratization-regimes`<br>`law-human-rights`<br>`labor-social-movements-gender` |
| japan | **— 空白** | `japan-periods` | **— 空白** |
| korea | **— 空白** | **— 空白** | `korea-history` |
| middle-east | **— 空白** | `islamic-world`<br>`ancient-near-east-egypt` | **— 空白** |
| north-africa | **— 空白** | `islamic-world` | **— 空白** |
| oceania | **— 空白** | **— 空白** | `oceania-pacific-world` |
| pacific | **— 空白** | **— 空白** | `oceania-pacific-world` |
| south-asia | **— 空白** | `south-asia-history` | **— 空白** |
| southeast-asia | **— 空白** | `southeast-asia-history` | **— 空白** |

尚未进入基线词表的区域空白包括巴尔干、中亚、东欧、伊朗、内亚、北欧、俄罗斯、南美与藏区；它们已在下方候选元数据中先登记。

## 候选新层与研究场景

以下 39 层是任务 B 的分批地图。`预计行数` 是有效事件目标，不含四行 `#` 头；实际交付后应与此值一致。所有 tags / regions 均已在受控词表登记。

### 学科内史（8）

| 状态 | id / name | tags | regions / scale / density | 预计行数 | 来源框架 | 服务的研究场景 |
| --- | --- | --- | --- | ---: | --- | --- |
| 已交付（批1） | `mathematics-history` / 数学史 | mathematics, science, knowledge, measurement | global / year / medium | 24 | 全球数学史通行分期、UNESCO 科学史框架 | 把数学家、定理或教材放进数制、证明与制度化背景 |
| 已交付（批1） | `logic-computing-ai` / 逻辑、计算与人工智能 | logic, computing, ai, philosophy | global / mixed / medium | 22 | 逻辑史、计算理论史与人工智能范式史 | 比较哲学逻辑、形式系统、算法与 AI 概念谱系 |
| 已交付（批1） | `physics-history` / 物理学史 | physics, science, astronomy, energy | global / year / medium | 24 | 全球物理学史与科学革命通行分期 | 为物理学家、理论与仪器提供古典到现代背景 |
| 已交付（批1） | `chemistry-history` / 化学史 | chemistry, science, industry, materials | global / year / medium | 20 | 炼金术—化学革命—工业化学的通行科学史框架 | 比较物质观、实验方法、元素体系与产业变化 |
| 已交付（批1） | `biology-evolution-history` / 生物学与演化论史 | biology, evolution, genetics, life | global / mixed / medium | 22 | 自然史、生物学、演化论与遗传学通行分期 | 研究物种观、演化论、遗传学或生态学时补足学科脉络 |
| 已交付（批1） | `economic-thought-history` / 经济思想史 | economic-thought, economy, capitalism, thought | global / year / medium | 22 | 经济思想史与政治经济学通行学派分期 | 把经济学家、政策争论与制度背景并置 |
| 已交付（批1） | `psychology-cognitive-science` / 心理学与认知科学史 | psychology, cognitive-science, medicine, science | global / year / medium | 20 | 心理学制度史与认知科学跨学科史 | 对照心理理论、实验方法、精神医学与计算模型 |
| 已交付（批1） | `geography-cartography` / 地理与制图史 | geography, cartography, exploration, knowledge | global / mixed / medium | 21 | 地理知识史、制图史与测绘技术通行框架 | 研究旅行、帝国、地图、边界或空间观念时提供背景 |

### 艺术与日常生活（7）

| 状态 | id / name | tags | regions / scale / density | 预计行数 | 来源框架 | 服务的研究场景 |
| --- | --- | --- | --- | ---: | --- | --- |
| 已交付（批2） | `music-history` / 音乐史 | music, art, culture, performance | global / year / medium | 22 | 全球音乐史通行时期与媒介变迁框架 | 比较作曲家、乐种、宗教仪式、录音与大众传播 |
| 已交付（批2） | `architecture-history` / 建筑史 | architecture, art, city, technology | global / year / medium | 23 | 全球建筑史、城市史与建造技术分期 | 把建筑师、风格、材料与政治宗教空间并置 |
| 已交付（批2） | `theatre-performance` / 戏剧与表演史 | theatre, performance, literature, ritual | global / year / medium | 20 | 全球戏剧史与表演研究通行分期 | 对照文本、舞台、仪式、剧团制度与观众形成 |
| 已交付（批2） | `film-moving-image` / 电影与影像史 | film, visual-media, media, technology | global / year / medium | 20 | 电影史、摄影史与广播影像媒介分期 | 研究导演、作品、宣传、技术制式与大众文化 |
| 已交付（批2） | `food-history` / 饮食史 | food, cuisine, agriculture, trade | global / mixed / medium | 21 | FAO 农业史、哥伦布大交换与全球饮食史框架 | 对照作物传播、贸易、阶层、工业食品与身份 |
| 已交付（批2） | `clothing-fashion` / 服饰与时尚史 | clothing, fashion, industry, identity | global / mixed / medium | 20 | 纺织技术史、物质文化史与现代时尚体系分期 | 研究服饰、身份、贸易、劳动和消费文化 |
| 已交付（批2） | `sports-competition` / 体育与竞技史 | sports, competition, ritual, society | global / mixed / medium | 20 | 古代竞技史、现代体育制度与奥林匹克运动框架 | 对照身体、仪式、民族国家、商业化与媒体 |

### 社会制度与身份（7）

| 状态 | id / name | tags | regions / scale / density | 预计行数 | 来源框架 | 服务的研究场景 |
| --- | --- | --- | --- | ---: | --- | --- |
| 已交付（批3） | `currency-measurement` / 货币与度量衡史 | currency, measurement, economy, state | global / mixed / medium | 22 | 货币史、计量史、IMF/BIS 国际货币制度框架 | 比较国家能力、市场、税收、贸易与标准化 |
| 已交付（批3） | `codes-written-law` / 法典与成文法史 | law, legal-code, state, rights | global / year / medium | 20 | 比较法制史与成文法典通行谱系 | 把法律文本、国家形成、权利与司法制度并置 |
| 已交付（批3） | `women-history` / 女性史 | women, gender, rights, labor | global / mixed / medium | 22 | 全球女性史、UN Women 与劳动权利框架 | 比较教育、财产权、政治参与、劳动与身体自主 |
| 已交付（批3） | `childhood-family` / 儿童与家庭史 | childhood, family, society, education | global / mixed / medium | 18 | 家庭史、历史人口学、UNICEF/ILO 儿童权利框架 | 研究亲属、教育、童工、福利与家庭结构 |
| 已交付（批3） | `pandemics-history` / 瘟疫与大流行史 | pandemic, disease, public-health, demography | global / mixed / medium | 20 | WHO 公共卫生里程碑与全球疾病史 | 将大流行作为人口、国家、劳动与知识背景单独比较 |
| 已交付（批3） | `disasters-earthquakes` / 灾害与地震史 | disaster, earthquake, environment, society | global / mixed / medium | 20 | USGS 地震尺度、全球灾害史与风险治理框架 | 对照灾害、城市、国家救济、工程与风险认知 |
| 已交付（批3） | `environmental-movement` / 环境保护运动史 | environmentalism, conservation, climate, politics | global / year / medium | 18 | UN 环境治理、保护运动史与 IPCC/UNFCCC 框架 | 比较保护观念、法规、社会运动与全球气候治理 |

### 区域细分（7）

| 状态 | id / name | tags | regions / scale / density | 预计行数 | 来源框架 | 服务的研究场景 |
| --- | --- | --- | --- | ---: | --- | --- |
| 待扩库 | `persia-iran-history` / 波斯与伊朗史 | iran, persia, empire, religion | iran, middle-east / year / medium | 22 | 伊朗史通行王朝分期与世界史帝国框架 | 对照两河、中亚、伊斯兰世界与近现代国家转型 |
| 待扩库 | `central-asia-silk-road-interior` / 中亚与丝路腹地史 | silk-road, trade, empire, migration | central-asia, eurasia / year / medium | 21 | UNESCO 丝绸之路框架与中亚区域史分期 | 研究商路、游牧—绿洲互动、帝国竞争与迁徙 |
| 待扩库 | `balkans-southeast-europe` / 巴尔干与东南欧史 | balkans, empire, nationalism, conflict | balkans, europe / year / medium | 22 | 东南欧区域史、奥斯曼—哈布斯堡边疆与民族国家分期 | 比较帝国边疆、宗教多样性、民族主义与战争 |
| 待扩库 | `south-america-history` / 南美洲历史 | south-america, indigenous, colonialism, revolution | south-america, americas / mixed / medium | 22 | 安第斯考古、殖民史、独立与拉美现代史分期 | 研究原住民国家、殖民经济、独立与社会运动 |
| 待扩库 | `nordic-history` / 北欧历史 | nordic, empire, state, welfare | northern-europe, europe / year / medium | 20 | 北欧区域史、维京时代、国家形成与福利国家框架 | 对照海洋网络、宗教改革、民族国家与社会政策 |
| 待扩库 | `eastern-europe-russia` / 东欧与俄罗斯史 | russia, empire, state, revolution | eastern-europe, russia, europe / year / medium | 24 | 东欧区域史、俄罗斯帝国—苏联—后苏联分期 | 比较帝国、农奴制、革命、社会主义与边界变化 |
| 待扩库 | `tibet-inner-asia` / 藏区与内亚史 | tibet, inner-asia, religion, trade | tibet, inner-asia, china, eurasia / year / medium | 20 | 藏区史、内亚史与跨喜马拉雅交流框架 | 研究宗教网络、帝国关系、贸易与高原社会 |

### 中国断代专题（5）

| 状态 | id / name | tags | regions / scale / density | 预计行数 | 来源框架 | 服务的研究场景 |
| --- | --- | --- | --- | ---: | --- | --- |
| 待扩库 | `china-thought-history` / 中国思想史 | china, thought, philosophy, religion | china / year / medium | 22 | 中国思想史通行学派与历史阶段 | 把思想家、经典与政治制度、宗教传播并置 |
| 待扩库 | `china-science-technology-history` / 中国科技史 | china, science, technology, knowledge | china / year / medium | 22 | 中国科学技术史与全球技术交流框架 | 研究发明、工艺、制度、知识传播及全球比较 |
| 待扩库 | `china-literature-history` / 中国文学史 | china, literature, writing, culture | china / year / medium | 24 | 中国文学史通行体裁与时代分期 | 对照作家、文体、媒介、科举与政治变迁 |
| 待扩库 | `china-economy-history` / 中国经济史 | china, economy, trade, agriculture | china / mixed / medium | 22 | 中国经济史、历史人口与全球贸易框架 | 比较土地、税制、市场、货币、工业化与改革 |
| 待扩库 | `china-art-history` / 中国艺术史 | china, art, painting, material-culture | china / year / medium | 22 | 中国艺术史、物质文化史与考古分期 | 研究书画、器物、宗教艺术、宫廷与市场 |

### 现代 / 当代细分（5）

| 状态 | id / name | tags | regions / scale / density | 预计行数 | 来源框架 | 服务的研究场景 |
| --- | --- | --- | --- | ---: | --- | --- |
| 待扩库 | `computer-internet-history` / 计算机与互联网史 | computing, internet, technology, information | global / mixed / medium | 22 | 计算机工程史、Internet Society/IETF 互联网里程碑框架 | 比较硬件、软件、网络、平台与信息社会 |
| 待扩库 | `space-race-exploration` / 航天与太空竞赛史 | space, space-race, politics, technology | global / mixed / medium | 20 | NASA 航天时间线与国际空间探索框架 | 对照冷战竞争、火箭技术、载人航天与合作 |
| 待扩库 | `modern-climate-change` / 现代气候变化史 | climate-change, climate, environment, science | global / mixed / medium | 20 | IPCC、UNFCCC、NASA/NOAA 气候科学框架 | 比较科学认识、观测、政策、能源与社会响应 |
| 待扩库 | `communication-networks` / 通信网络史 | communication, network, media, technology | global / mixed / medium | 22 | ITU 通信史与电报—电话—移动网络技术分期 | 研究媒介、基础设施、国家、企业与空间压缩 |
| 待扩库 | `cold-war-globalization` / 冷战与全球化格局 | cold-war, globalization, geopolitics, trade | global / year / medium | 22 | 冷战国际史、UN 体系与全球化通行分期 | 为战后政治、经济、文化与区域冲突提供同一骨架 |

## 当前覆盖矩阵（扩库进度）

当前共 62 层：原 40 层加已交付的学科内史 8 层、艺术与日常生活 7 层、社会制度与身份 7 层。本节随每批更新；基线矩阵保留在上方供比较。

### 学科 × 尺度

| 学科 | deep-time | year | mixed |
| --- | --- | --- | --- |
| 综合 / 大历史 | `big-history-thresholds` | `ap-world-periods` | **— 空白** |
| 地球、生命与环境 | `geology-life` | **— 空白** | `climate-environment` |
| 人口、生计与社会 | **— 空白** | **— 空白** | `human-migration-population`<br>`agriculture-domestication`<br>`labor-social-movements-gender` |
| 政治、制度与冲突 | **— 空白** | `world-empires`<br>`colonialism-decolonization` | `major-wars`<br>`political-revolutions`<br>`democratization-regimes`<br>`law-human-rights` |
| 区域通史 | **— 空白** | `china-dynasties`<br>`europe-periods`<br>`islamic-world`<br>`south-asia-history`<br>`japan-periods`<br>`southeast-asia-history`<br>`africa-kingdoms-colonialism`<br>`eurasian-steppe-nomads`<br>`ancient-near-east-egypt` | `korea-history`<br>`americas-civilizations-colonialism`<br>`oceania-pacific-world` |
| 思想与宗教 | **— 空白** | `thought-movements` | `religion-history` |
| 文学、艺术与文化 | **— 空白** | `literature-art` | **— 空白** |
| 教育、知识与媒介 | **— 空白** | `language-translation` | `education-knowledge-institutions`<br>`media-information` |
| 科学、技术与医学 | **— 空白** | `science-technology` | `medicine-public-health`<br>`astronomy-space` |
| 经济、贸易与金融 | **— 空白** | **— 空白** | `trade-networks`<br>`economy-society`<br>`capitalism-finance` |
| 聚落、交通与能源 | **— 空白** | **— 空白** | `transport-spatial-compression`<br>`energy-history`<br>`urbanization-city-form` |
| 学科内史 | **— 空白** | `mathematics-history`<br>`physics-history`<br>`chemistry-history`<br>`economic-thought-history`<br>`psychology-cognitive-science` | `logic-computing-ai`<br>`biology-evolution-history`<br>`geography-cartography` |
| 艺术与日常生活 | **— 空白** | `music-history`<br>`architecture-history`<br>`theatre-performance`<br>`film-moving-image` | `food-history`<br>`clothing-fashion`<br>`sports-competition` |
| 社会制度与身份 | **— 空白** | `codes-written-law`<br>`environmental-movement` | `currency-measurement`<br>`women-history`<br>`childhood-family`<br>`pandemics-history`<br>`disasters-earthquakes` |
| 中国专题 | **— 空白** | **— 空白** | **— 空白** |
| 现代 / 当代系统 | **— 空白** | **— 空白** | **— 空白** |

### region × scale（层数）

| region | deep-time | year | mixed |
| --- | ---: | ---: | ---: |
| africa | 0 | 1 | 0 |
| americas | 0 | 0 | 1 |
| china | 0 | 3 | 0 |
| egypt | 0 | 1 | 0 |
| eurasia | 0 | 1 | 0 |
| europe | 0 | 3 | 0 |
| global | 2 | 18 | 30 |
| japan | 0 | 1 | 0 |
| korea | 0 | 0 | 1 |
| middle-east | 0 | 2 | 0 |
| north-africa | 0 | 1 | 0 |
| oceania | 0 | 0 | 1 |
| pacific | 0 | 0 | 1 |
| south-asia | 0 | 1 | 0 |
| southeast-asia | 0 | 1 | 0 |
| **未有独立层的已登记 region** | **— 空白** | balkans, central-asia, eastern-europe, inner-asia, iran, northern-europe, russia, south-america, tibet | **— 空白** |

## 40 层一致性审计

审计直接调用 `src/csv.js` 的 `parseTimelineCSV()`，从而复用 `src/time.js` 的 `parseTimeExpression()`，没有另写时间解析器。基线结果：

- Manifest 40 条、目录 40 个 CSV；每个路径存在，无未引用 CSV，`id` 与 `file` 均无重复。
- 588 个有效事件全部可解析；单层 9–27 条。19 层处于通常的 15–40 条区间，21 层少于 15 条但仍是可用的宏观骨架，没有任何层超过 40 条。
- 所有数据行严格两列；无坏引号、缺列、额外列、无效时间或重复事件。
- 所有 tags、regions、scale、density 都在 `background/vocabulary.json` 中；数组均非空。
- `open_interval` 与 `mixed_precision` 是有意的信息提示，不是解析失败：前者表示持续至今的制度 / 阶段，后者表示少量近现代条目采用日期级边界。

发现并修复的漂移：原 40 层注释头都有用途说明，但全部缺少明确来源框架和“用于定位、非权威完整年表”声明。现已逐层补上相应来源框架和统一边界声明；有效事件与原始时间未改动。审计规则已进入 Node 质量门，后续新增层也必须满足同一约束。
