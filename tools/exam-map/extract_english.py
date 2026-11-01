#!/usr/bin/env python3
"""把正式站同步来的英语语法页里的教材语法点抽成考前脑图用的 JSON。
来源（都在仓库里，随每日同步更新）：
  apps/kenton_english_grammar_20261006.html / apps/eddey_english_grammar_20261006.html  → const DATA={courses:{who:[...]}}
  apps/eddey_english_u4_review_20261019.html → const GRAMMAR=[...] + const Q=[...]
输出 apps/v2/exam-map/data/english-grammar.json。上游页面改了就重跑：python3 -I tools/exam-map/extract_english.py
"""
import json, re, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'apps/v2/exam-map/data/english-grammar.json'
# 课本页 → 单元（与正式站《知识连起来》里的 source 页码一致）
UNITS = {'kenton': [(9, 16, 1), (17, 24, 2), (25, 32, 3), (33, 40, 4)], 'eddey': [(7, 14, 1), (15, 22, 2), (23, 30, 3), (31, 38, 4), (39, 46, 5)]}

def brace_block(s, start):
    depth = 0
    for j in range(start, len(s)):
        c = s[j]
        if c in '{[': depth += 1
        elif c in '}]':
            depth -= 1
            if depth == 0: return s[start:j + 1]
    raise ValueError('unbalanced')

def unit_of(who, pages):
    nums = [int(x) for x in re.findall(r'\d+', pages or '')]
    for n in nums:
        for a, b, u in UNITS[who]:
            if a <= n <= b: return u
    return None

def grammar_courses(who):
    s = (ROOT / f'apps/{who}_english_grammar_20261006.html').read_text(encoding='utf-8')
    i = s.find('const DATA=') + len('const DATA=')
    data = json.loads(brace_block(s, i))
    out = []
    for c in data['courses'][who]:
        qs = [{'type': 'text', 'prompt': ch['prompt'], 'answer': ch['answers'][0], 'aliases': ch['answers'][1:], 'why': ch.get('why', '')} for ch in c.get('checks', [])]
        t = c.get('transfer')
        if t: qs.append({'type': 'text', 'prompt': t['prompt'], 'answer': t['answers'][0], 'aliases': t['answers'][1:], 'why': t.get('why', '')})
        out.append({'id': 'eg-' + c['id'], 'title': c.get('ink') or c['title'], 'sub': c['title'], 'unit': unit_of(who, c.get('pages')), 'pages': c.get('pages', ''), 'source': f"{'新版五上' if who=='kenton' else '新版四上'}英语课本 pp.{c.get('pages','')} · 语法变形台", 'quote': c.get('quote', ''), 'idea': c['rule'], 'recall': c.get('cue', ''), 'states': [{'label': st['label'], 'parts': st['parts']} for st in c.get('states', [])], 'questions': qs, 'tip': c.get('note', '')})
    return out

def eddey_u4():
    s = (ROOT / 'apps/eddey_english_u4_review_20261019.html').read_text(encoding='utf-8')
    g = s[s.find('const GRAMMAR=') + len('const GRAMMAR='):]
    g = brace_block(g, 0)
    # 对象字面量不是严格 JSON：键无引号、单引号字符串
    g = re.sub(r'([{,]\s*)([a-zA-Z_]+)\s*:', r'\1"\2":', g)
    g = re.sub(r"'((?:[^'\\]|\\.)*)'", lambda m: json.dumps(m.group(1)), g)
    grammar = json.loads(g)
    qsrc = s[s.find('const Q=[') + len('const Q='):]
    qsrc = brace_block(qsrc, 0)
    qs = []
    for m in re.finditer(r"QUESTION\('([^']+)','((?:[^'\\]|\\.)*)',\[((?:[^\]])*)\],'([^']+)','((?:[^'\\]|\\.)*)'", qsrc):
        qid, prompt, answers, skill, why = m.groups()
        ans = re.findall(r"'((?:[^'\\]|\\.)*)'", answers)
        if qid.startswith('g-'): qs.append({'skill': skill, 'q': {'type': 'text', 'prompt': prompt, 'answer': ans[0], 'aliases': ans[1:], 'why': why}})
    out = []
    for gr in grammar:
        out.append({'id': 'eg-u4-' + gr['id'], 'title': gr['title'], 'unit': 4, 'pages': '', 'source': '新版四上英语 U4 · 单元复习页', 'quote': gr.get('sample', ''), 'idea': gr['rule'], 'recall': '', 'states': [{'label': '例句', 'parts': [p.strip() for p in gr.get('sample', '').split('/') if p.strip()]}] if gr.get('sample') else [], 'questions': [x['q'] for x in qs if x['skill'] == gr['id']], 'tip': gr.get('note', '')})
    return out

data = {'generated': 'tools/exam-map/extract_english.py', 'kenton': grammar_courses('kenton'), 'eddey': grammar_courses('eddey') + eddey_u4()}
OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
for who in ('kenton', 'eddey'):
    print(who, len(data[who]), 'points;', sum(len(x['questions']) for x in data[who]), 'questions;', [(x['id'], x['unit']) for x in data[who] if not x['unit']] or 'all units mapped')
