---
title: "Почему я всё ещё пишу манифесты Kubernetes руками"
description: "Helm и Kustomize хороши. Вот почему я не беру их в первую очередь."
date: 2026-02-10
tags: ["kubernetes", "opinion"]
---

У меня есть kubectl apply alias, который указывает на raw YAML-файлы, и он служит мне годами. В прошлом месяце коллега спросил, почему я просто не использую Helm. Вот почему.

## Debuggability

Raw манифесты можно grep-ить, diff-ить, paste-ить в Slack. Когда что-то ломается в 2 ночи, я не хочу трассировать три слоя Helm-темплейтинга, чтобы выяснить, какой value override произвёл broken YAML, который попал в кластер.

Я провёл часы, дебажа Helm charts, где rendered манифест выглядел совершенно не так, как я ожидал, из-за nested template include, который тянул values из parent chart dependencies. Error message указывала на строку 47 rendered output, но не было строки 47 ни в одном из source templates — она была synthesized из пяти разных файлов.

С raw манифестами то, что вы пишете, — это то, что вы получаете. Если Deployment не создаёт поды, я открываю Deployment manifest, читаю spec и вижу проблему. Никакого rendering-шага. Никакого "какой values.yaml файл на самом деле используется?"

Git diff чистые. `git diff` на raw манифесте показывает точно, что изменилось — одно поле, одна строка. `git diff` на Helm chart показывает изменения в Go templates, и вы должны ментально рендерить их, чтобы понять actual Kubernetes resource change. Code review становится медленнее.

## Глубина навыка

Написание raw манифестов держит меня fluent в underlying API. Я знаю, какие поля существуют на Deployment, потому что я набирал их десятки раз. Я знаю разницу между `strategy.type: RollingUpdate` и `strategy.type: Recreate`, потому что я использовал оба и наблюдал rollout behavior.

Когда Helm-абстракции ломаются — а они ломаются — я всё ещё могу рассуждать о том, что на самом деле отправляется на API server. Helm — это tool, который генерирует YAML. Если вы не понимаете YAML, который он генерирует, вы debug вслепую.

Я видел инженеров, которые изучали Kubernetes через Helm, struggle, когда они сталкиваются с кластером, где ничего не темплейтится. Они знают, как модифицировать `values.yaml`, но они не знают, что делает PodSecurityPolicy или почему ServiceAccount нужен RoleBinding. Абстракция стала их потолком, а не их полом.

Raw манифесты заставляют вас изучать API. Это знание переносится на каждый кластер, каждый tool, каждую debugging-сессию. Helm-знание переносится на других Helm-пользователей.

## Налог абстракции

Helm charts для toy-сервисов вводят больше cognitive overhead, чем сами сервисы, которые они описывают. Трёхфайловое Kubernetes-приложение (Deployment, Service, Ingress) становится Helm chart с templates/, values.yaml, Chart.yaml, _helpers.tpl и дюжиной файлов boilerplate.

Для single service с одним environment Helm — это overkill. Вы платите abstraction tax — изучение Helm-темплейтинга, обращение с его release lifecycle, управление его versioning — без benefit. YAML проще, чем Helm chart.

Kustomize overlay stacks могут стать своей собственной maintenance-проблемой. Я видел четырёхслойные Kustomize hierarchies (base → cluster-level → namespace-level → app-level), где вы должны trace через все четыре слоя, чтобы понять, почему particular annotation существует на final resource. Композиция была elegant в теории. На практике она была opaque.

Абстракции дорогие. Вы платите cost в cognitive load, onboarding time и debugging complexity. Этот cost worth it, когда у вас есть variation at scale — 10 environments, 100 сервисов, platform-команда, управляющая shared infrastructure. Он не worth it для small fleets, где variation низкий.

## Когда бы я использовал Helm

100-сервисная platform-команда нуждается в темплейтинге. Вы не можете copy-paste 100 Deployment и вручную update image tags. Helm даёт вам parameterization, versioning и rollback. Abstraction tax оправдан, потому что альтернатива — управлять 100 raw manifest sets — хуже.

Ops-команда, которая не читает YAML ежедневно, нуждается в Helm batteries. Они хотят `helm install postgres bitnami/postgresql` и running базу данных, а не 15 минут читать PostgreSQL StatefulSet docs. Helm charts package operational knowledge. Это valuable, когда вы не Kubernetes-эксперт.

Multi-cluster GitOps fleet нуждается в Kustomize overlays. Когда у вас 20 кластеров в разных регионах с slightly different configs (image registries, storage classes, ingress controllers), Kustomize позволяет вам определить base один раз и layer cluster-specific overrides. Чистое разделение. Никакого copy-paste drift.

## Практическая эвристика

Начните с raw YAML. Если у вас меньше 5 environments и меньше 10 сервисов, raw манифесты проще, яснее и легче debug.

Переходите на Helm, когда у вас больше ~5 environments или ~10 сервисов. На этом scale parameterization pays for itself. Но держите Helm charts простыми — prefer values над complex темплейтингом. Цель — "одно место, чтобы изменить image tag", а не "Turing-complete configuration language".

Переходите на Kustomize, когда вам нужны clean overlays без темплейтинга. Kustomize лучше, чем Helm, для multi-cluster сценариев, где каждому кластеру нужны small tweaks к shared base. Он хуже, чем Helm, когда вам нужен heavy parameterization или вы хотите package и version ваши deployments как artifacts.

## Реальный вопрос

Реальный вопрос не "Helm или raw манифесты?" Это "какой уровень абстракции matches вашей команды scale и skill?"

Если вы solo-разработчик, запускающий два сервиса в одном кластере, raw манифесты быстрее, чем изучение Helm. Если вы platform-команда, управляющая 50 микросервисами через 10 environments, Helm обязателен. Если вы где-то посередине, ответ зависит от того, сколько variation у вас есть и как часто оно меняется.

Я пишу raw манифесты руками, потому что большая часть моей работы на small end этого scale — one-off engagements, proof-of-concept кластеры, troubleshooting customer setups. Cognitive overhead Helm замедлил бы меня больше, чем ускорил.

Ваш mileage будет vary.
