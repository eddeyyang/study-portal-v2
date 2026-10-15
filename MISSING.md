# 缺失清单（2026-10-15 核对）

下面的文件被页面引用，但线上网站本身就没有（访问返回 404），所以仓库里也没有。不是这次整理弄丢的。

## 一、朗读音频

这些应用找不到预录音频时，会退回浏览器自带的机器朗读。现行规则不允许浏览器随机语音“静默兜底”，所以它们的声音都算未达标。

| 音频目录 | 缺多少条 | 用到它的应用 |
| --- | --- | --- |
| `kenton_english_dictation` | 153 | 哥哥《英语单词默写 · 全册整合》 |
| `eddey_english_dictation` | 138 | 弟弟《英语单词默写 · 全册整合》 |
| `preply-going-to` | 151 | 弟弟《日常的一天 + going to 计划》《一般将来时四大法宝》，外教课 going to beach |
| `kenton_verb_lab` | 135 | 哥哥暑假英语馆的动词实验室 |
| `kenton_english_monday_lab` | 55 | 哥哥暑假英语馆的周一实验室 |
| `kenton_english_clause_lab` | 30 | 哥哥暑假英语馆的从句实验室 |
| `kenton-sound-connections-20261001` | 21 | 哥哥《声音连线 · ow / ou / ui》 |
| `hetao_coding_l3-1_review` `l3-2_review` `l3-3_preview` `l3-3_review` | 6 + 7 + 13 + 10 | 编程中心里的四节核桃编程复习/预习 |
| `ai_academy` `ai_lab` | 8 + 8 | 《AI 学院 · 引擎室》《AI 探索馆》（两孩共用） |
| `eddey_english` | 没有清单 | 弟弟《英语练习 · 三下》（家长电脑 7 月快照里有 154 条，可补） |
| `eddey_chinese_master` `kenton_chinese_master` | 没有清单 | 两孩《语文总复习》（三下、四下） |
| `eddey_en_sprint` `kenton_en_sprint` | 没有清单 | 两孩《英语期末冲刺复习 · 错题闯关》 |
| `news_20260615` `news_20260616` `news_20260617` | 没有清单 | 6 月 15–17 日三期《小小世界播报》 |

有清单的合计约 735 条。音频文件名由 `语言|文字` 算出（FNV-1a），补录时必须用同样的算法命名，并按现行音频规则逐条试听、实机播放。

## 二、页面与程序文件

| 文件 | 影响 |
| --- | --- |
| `mistake_analysis.html` | 错题本里有一个链接指向它，点开会是空页 |
| `assets/paper-ocr/assets/worker-entry-C9UNuyOJ.js` | 试卷录入的识字功能用到的后台程序文件，缺了可能识别不了（未实测） |

## 三、线上主动下架的页面（不算缺失）

`data/portal-navigation.json` 的 `unavailableFiles` 列出了 22 期新闻（2026-06-23 至 07-22）和 3 节核桃编程（L2-3/L2-4、L2-4/L3-1、L3-1/L3-2）。门户不会显示它们，不需要补。
