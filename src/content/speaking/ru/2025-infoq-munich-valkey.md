---
title: "Beyond Speed Limits: Exploring the Performance Power of Valkey"
event: "InfoQ Dev Summit Munich"
city: "Мюнхен"
date: 2025-10-15
tags: ["Valkey", "Caching", "Latency", "Databases", "AWS"]
video: "https://www.infoq.com/presentations/valkey-datastore"
draft: false
---

Valkey, форк Redis с открытым исходным кодом, как слой в памяти, где чтение занимает меньше миллисекунды. Доклад построен на одном примере, маркетплейсе изображений: от реляционной базы, которая упирается в свой предел, до кеша перед ней на Amazon ElastiCache. Сначала стратегии кеширования (lazy loading, write-through, инвалидация через DynamoDB и Lambda, горячие ключи, проблема thundering herd, клиентский кеш). Затем структуры данных под типичные задачи: хеши для сессий и feature store, сортированные множества и HyperLogLog для аналитики в реальном времени, Lua-скрипты для rate limiting со счётчиком и с token bucket. В конце советы по эксплуатации: считать кеш данными, которые не страшно потерять, задавать TTL для каждого элемента со случайным разбросом (jitter), а не один TTL на весь сервер, и заранее продумать вытеснение и размер кеша.

50-минутная сессия на [InfoQ Dev Summit Munich 2025](https://devsummit.infoq.com/presentation/munich2025/beyond-speed-limits-exploring-performance-power-valkey) 15 октября 2025 в зале Versailles в Smartvillage Bogenhausen, Мюнхен. Запись с полной расшифровкой есть на [InfoQ](https://www.infoq.com/presentations/valkey-datastore).
