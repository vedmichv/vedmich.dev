---
title: "Scaling machine learning with containers on AWS: Lessons learned"
event: "AWS re:Invent"
city: "Las Vegas"
date: 2024-12-04
tags: ["Machine Learning", "Containers", "Serverless", "SageMaker", "AWS"]
draft: false
---

Как Instrumental, платформа для оптимизации производства, держит машинное обучение в проде на масштабе и обходится бессерверными контейнерами: запускает десятки тысяч обучающих задач в месяц, отдаёт десятки миллионов предсказаний и проходит исследовательскую итерацию за дни, а не за недели. Рустем рассказал, как устроена платформа, как обычно живёт ML-проект и как команда мигрировала. Я разобрал, какие варианты контейнеров AWS предлагает для ML-нагрузок и какие уроки мы вынесли по дороге, а в демо запустил обучающие задачи в Amazon SageMaker пачками на Spot-мощностях и показал, как AWS Lambda отдаёт предсказания. Итог доклада: бессерверный подход к MLOps, который подходит и внутренним, и внешним пользователям.

Сессию DEV317 (breakout) мы провели на [AWS re:Invent 2024](https://reinvent.awsevents.com/) в Лас-Вегасе 4 декабря 2024 вместе с [Рустемом Фейзхановым](https://www.linkedin.com/in/ryfeus/), Staff Machine Learning Engineer в Instrumental и AWS Machine Learning Hero.
