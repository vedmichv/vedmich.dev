---
title: "Beyond Speed Limits: Exploring the Performance Power of Valkey"
event: "InfoQ Dev Summit Munich"
city: "Munich"
date: 2025-10-15
tags: ["Valkey", "Caching", "Latency", "Databases", "AWS"]
video: "https://www.infoq.com/presentations/valkey-datastore"
transcript: "https://www.infoq.com/presentations/valkey-datastore"
highlight: "Published on InfoQ with a full transcript"
draft: false
---

Valkey, the open-source fork of Redis, as the in-memory layer that brings read latency below one millisecond. The talk follows one example, a marketplace for images, from a relational database that reaches its limits to a cache in front of it on Amazon ElastiCache. It covers caching strategies (lazy loading, write-through, invalidation with DynamoDB and Lambda, hot keys, the thundering herd problem, client-side caching). Then come the data structures behind typical use cases: hashes for sessions and a feature store, sorted sets and HyperLogLog for real-time analytics, Lua scripts for rate limiting with a counter and with a token bucket. It closes with operating advice: treat the cache as data you can afford to lose, set a TTL per item with random jitter instead of one global TTL, and plan eviction and cache size.

A 50-minute session at [InfoQ Dev Summit Munich 2025](https://devsummit.infoq.com/presentation/munich2025/beyond-speed-limits-exploring-performance-power-valkey) on 15 October 2025, in the Versailles room at Smartvillage Bogenhausen in Munich. On 8 June 2026 InfoQ published the [recording with a full transcript](https://www.infoq.com/presentations/valkey-datastore). The transcript follows the talk section by section, from caching strategies and data structures to operating advice and questions from the audience.
