#!/usr/bin/env python3
"""Mirror vedmich.dev blog posts into Obsidian notes for review comments.

Usage: scripts/export-blog-to-vault.py <repo> <out_dir> <commit_sha>

Writes one note per post and locale. MDX components become callouts with links
to the live site; images and internal links become absolute vedmich.dev URLs.
The notes are review copies: changes go into src/content/blog, then re-export.
"""
import re, sys, pathlib, datetime, zoneinfo, json

SITE = 'https://vedmich.dev'
repo, out, sha = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]), sys.argv[3]
now = datetime.datetime.now(zoneinfo.ZoneInfo('Europe/Berlin')).strftime('%Y-%m-%d, %H:%M:%S')
unknown = []

def split_fm(text):
    m = re.match(r'^---\n(.*?)\n---\n', text, re.S)
    return (m.group(1), text[m.end():]) if m else ('', text)

def fm_value(fm, key):
    m = re.search(rf'^{key}:\s*(.*)$', fm, re.M)
    if not m: return None
    v = m.group(1).strip()
    if v.startswith('"') and v.endswith('"'): v = json.loads(v)
    return v

def fm_tags(fm):
    m = re.search(r'^tags:\s*\[(.*?)\]', fm, re.M)
    if m: return [t.strip().strip('"\'') for t in m.group(1).split(',') if t.strip()]
    m = re.search(r'^tags:\s*\n((?:\s+-\s*.*\n)+)', fm + '\n', re.M)
    return [l.strip()[1:].strip().strip('"\'') for l in m.group(1).splitlines()] if m else []

def attr(tag, name):
    m = re.search(rf'\b{name}=(?:"([^"]*)"|\{{([^}}]*)\}}|\'([^\']*)\')', tag)
    return next((g for g in m.groups() if g is not None), None) if m else None

def absolute(url):
    return SITE + url if url and url.startswith('/') else url

def convert(body, lang):
    ru = lang == 'ru'
    out_lines, in_code = [], False
    # protect code fences
    parts = re.split(r'(^```.*?^```[ \t]*$)', body, flags=re.S | re.M)
    res = []
    for i, part in enumerate(parts):
        if i % 2 == 1:
            res.append(part); continue
        p = re.sub(r'^import .*? from .*?;?\s*$\n?', '', part, flags=re.M)
        def slide(m):
            t = m.group(0); slug, n = attr(t, 'slug'), attr(t, 'slide')
            title, cap = attr(t, 'title') or '', attr(t, 'caption') or ''
            url = f'{SITE}/slides/{slug}/{n}' if slug else None
            label = 'Слайд' if ru else 'Slide'
            s = f'> [!example] {label} {n}: {title}\n'
            if cap: s += f'> {cap}\n'
            if url: s += f'> [{"Открыть слайд" if ru else "Open the slide"}]({url})\n'
            return s
        p = re.sub(r'<SlideEmbed\b.*?/>', slide, p, flags=re.S)
        def html(m):
            t = m.group(0); src, title = attr(t, 'src'), attr(t, 'title') or ''
            label = 'Интерактивная вставка' if ru else 'Interactive embed'
            return f'> [!example] {label}: {title}\n> [{"Открыть" if ru else "Open"}]({absolute(src)})\n'
        p = re.sub(r'<HtmlEmbed\b.*?/>', html, p, flags=re.S)
        def anim(m):
            name = m.group(1)
            label = 'Анимация на странице статьи' if ru else 'Animation on the article page'
            return f'> [!example] {label}: `{name}`\n'
        p = re.sub(r'<(PodLifecycleAnimation|[A-Z][A-Za-z]*Animation)\b[^>]*/>', anim, p)
        def book(m):
            return f'[Cracking the Kubernetes Interview]({SITE}/{lang}/#book)'
        p = re.sub(r'<BookLink\b[^>]*/>', book, p)
        def figure(m):
            t = m.group(0); src, alt = attr(t, 'src'), attr(t, 'alt') or ''
            cap = re.search(r'<figcaption[^>]*>(.*?)</figcaption>', t, re.S)
            s = f'![{alt}]({absolute(src)})\n'
            if cap: s += f'\n*{re.sub(r"<[^>]+>", "", cap.group(1)).strip()}*\n'
            return s
        p = re.sub(r'<figure\b.*?</figure>', figure, p, flags=re.S)
        def video(m):
            t = m.group(0); src = re.search(r'src="([^"]+)"', t)
            label = attr(t, 'aria-label') or ('Видео' if ru else 'Video')
            return f'> [!example] {label}\n> [{"Открыть видео" if ru else "Open the video"}]({absolute(src.group(1)) if src else SITE})\n'
        p = re.sub(r'<video\b.*?</video>', video, p, flags=re.S)
        p = re.sub(r'<img\b[^>]*>', lambda m: f'![{attr(m.group(0), "alt") or ""}]({absolute(attr(m.group(0), "src"))})', p)
        p = re.sub(r'\]\((/[^)\s]*)\)', lambda m: f']({absolute(m.group(1))})', p)
        for tag in set(re.findall(r'<([A-Z][A-Za-z]+)\b', p)):
            unknown.append(tag)
        res.append(p)
    return ''.join(res)

out.mkdir(parents=True, exist_ok=True)
written = []
for lang in ('en', 'ru'):
    for src in sorted((repo / 'src/content/blog' / lang).glob('*.md*')):
        if src.name.startswith('__'): continue
        fm, body = split_fm(src.read_text(encoding='utf-8'))
        slug = re.sub(r'\.mdx?$', '', src.name)
        name = f'{slug} {lang.upper()}'
        other = f'{slug} {"RU" if lang == "en" else "EN"}'
        has_other = (repo / 'src/content/blog' / ('ru' if lang == 'en' else 'en')).glob(f'{slug}.md*')
        has_other = any(True for _ in has_other)
        draft = (fm_value(fm, 'draft') or 'false') == 'true'
        url = f'{SITE}/{lang}/blog/{slug}/'
        title, desc, date = fm_value(fm, 'title'), fm_value(fm, 'description'), fm_value(fm, 'date')
        tags = fm_tags(fm)
        dump = lambda v: json.dumps(v, ensure_ascii=False)
        head = ['---', 'aliases:', f'  - {name}', f'date_created: {now}', f'date_modified: {now}', 'tags:',
                '  - blog', '  - vedmich-dev', '  - review',
                f'status: {"draft" if draft else "published"}', f'lang: {lang}', f'title: {dump(title)}',
                f'description: {dump(desc)}', f'date: {date}', f'site_tags: {dump(tags)}',
                f'site_source: src/content/blog/{lang}/{src.name}', f'site_commit: {sha}',
                f'published_url: {url}', '---', '']
        if lang == 'ru':
            note = (f'> [!info] Зеркало статьи с vedmich.dev\n> Снимок из репозитория (коммит `{sha}`, {now[:10]}). '
                    f'Комментарии оставляй через Comments plugin, по команде «обработай комменты» правки уходят в '
                    f'репозиторий (EN и RU вместе), а заметка пересобирается. Саму заметку руками не правь.\n'
                    f'> На сайте: {url}' + (f'\n> Английская версия: [[{other}]]' if has_other else '') +
                    ('\n> Статус: черновик, страница не в списках и не индексируется.' if draft else '') + '\n')
        else:
            note = (f'> [!info] Зеркало статьи с vedmich.dev\n> Снимок из репозитория (коммит `{sha}`, {now[:10]}). '
                    f'Комментарии оставляй через Comments plugin, по команде «обработай комменты» правки уходят в '
                    f'репозиторий (EN и RU вместе), а заметка пересобирается. Саму заметку руками не правь.\n'
                    f'> На сайте: {url}' + (f'\n> Русская версия: [[{other}]]' if has_other else '\n> Русской версии на сайте нет.') +
                    ('\n> Статус: черновик, страница не в списках и не индексируется.' if draft else '') + '\n')
        text = '\n'.join(head) + note + f'\n# {title}\n\n' + convert(body, lang).lstrip('\n')
        (out / f'{name}.md').write_text(text, encoding='utf-8')
        written.append(name)
print('written', len(written)); print('unknown components:', sorted(set(unknown)) or 'none')
