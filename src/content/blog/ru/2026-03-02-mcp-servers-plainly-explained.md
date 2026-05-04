---
title: "MCP-серверы простыми словами"
description: "Что на самом деле делает Model Context Protocol сервер — и чем AWS Knowledge MCP отличается от AWS Documentation MCP."
date: 2026-03-02
tags: ["ai", "mcp", "agents"]
---

MCP-сервер — это маленькая программа, которая учит вашего AI-агента одному новому навыку — прочитать эти доки, запросить эту базу, запустить эту CLI. Model Context Protocol от Anthropic — это контракт, который делает их pluggable.

До MCP каждый AI-инструмент имел свою систему плагинов. Cursor plugins не работали в GitHub Copilot. Claude integrations не работали в Zed. Если вы создавали tool, который позволял Claude запросить вашу PostgreSQL базу, вы не могли переиспользовать его в другой IDE без полной переписывания.

MCP — это USB-C для AI. Один сервер, все инструменты.

## Как это устроено

MCP-сервер предоставляет capabilities. Клиент — ваша IDE, ваш agent framework, ваш chatbot — подключается к серверу по JSON-RPC и спрашивает: что ты умеешь?

Сервер отвечает списком tools. Каждый tool имеет имя, описание и схему. Клиент передаёт tools языковой модели. Когда модель решает использовать tool, клиент вызывает сервер. Сервер выполняет tool и возвращает результат. Клиент отправляет результат обратно модели.

<img
  src="/blog-assets/2026-03-02-mcp-servers-plainly-explained/diagrams/client-server.svg"
  alt="Архитектура MCP клиент-сервер: Claude Code подключается к MCP-серверу, который обращается к внешним ресурсам (docs, DB, API)"
  loading="eager"
  width="820"
  height="100"
  style="max-width: 100%; height: auto;"
/>

Клиент — это orchestrator. Сервер — это integration layer. Модель — это мозг, который решает, какие tools вызывать.

Вот что делает MCP отличным от ранних tool-протоколов: он bidirectional, stateful и transport-agnostic. Сервер может push-ить ресурсы клиенту (например, "вот 5 последних файлов, которые ты редактировал"), а не только отвечать на вызовы. Сервер может удерживать state между вызовами tools (например, поддерживать database connection pool). И transport может быть stdio, HTTP или WebSocket — MCP не важно.

## Три конкретных сервера, которые я использую

**AWS Documentation MCP** ищет документацию AWS-сервисов. Я спрашиваю Claude: "Какие поля в VPC flow log?" Claude вызывает AWS Documentation MCP-сервер с запросом `VPC flow log fields`. Сервер бьёт AWS docs search API, возвращает топ-3 результатов. Claude читает их и отвечает на мой вопрос с реальной, актуальной документацией вместо training-data знаний, которым может быть два года.

**AWS Knowledge MCP** ищет AWS re:Post, посты в блогах и whitepapers. Это как AWS Documentation MCP, но шире — он покрывает community discussions и real-world паттерны, а не только API reference docs. Я использую его, когда troubleshooting. "Почему мой Lambda cold start занимает 8 секунд?" AWS Knowledge MCP находит re:Post thread, где кто-то столкнулся с той же проблемой с VPC-attached Lambda и большими deployment packages.

**QMD MCP** (Quantum Memory Disk) ищет мой Obsidian vault. Мой vault содержит 5 лет architecture notes, клиентских engagements (анонимизированных) и Kubernetes troubleshooting сессий. Я спрашиваю Claude: "Покажи заметки про Karpenter consolidation." QMD MCP возвращает 3 vault notes. Claude синтезирует их в ответ, который основан на моём собственном опыте, а не generic training data.

Паттерн: каждый сервер — это тонкая обёртка вокруг data source. Сервер не делает intelligence — модель делает. Сервер просто fetches.

## Что означает "простыми словами"

MCP-серверы — не магия. Это просто JSON-RPC API с schema-контрактом.

Если underlying data source неправильный, сервер возвращает неправильные результаты. Если ваша документация устарела, AWS Documentation MCP даст вам устаревшие ответы. Если ваша база данных имеет плохие данные, ваш MCP-сервер surface плохие данные. Модель доверяет tools. Вы должны доверять серверам.

Аутентификация всё ещё важна. AWS MCP-серверы используют IAM credentials или OAuth токены. Если вы expose MCP-сервер по HTTP, вам нужно authenticate клиента. Если вы запускаете MCP-сервер локально через stdio, клиент наследует permissions вашего shell. Я видел разработчиков, случайно давших Claude write-доступ к production базе, потому что они забыли, что MCP-сервер запущен с их DBA credentials.

Context rot реален. Если вы load 60 MCP-серверов в Claude при startup, вы жжёте 10,000+ токенов просто на listing tool definitions. Модель видит все 60 tools, но она может рассуждать только над теми, которые fit в context. AWS Kiro (next-gen AI IDE) решает это с "Powers" — dynamic tool loading на основе того, над чем модель работает. Вы не load все 60 AWS MCP-серверов. Вы load 3, которые relevant текущему файлу.

## Когда писать свой

Начните с first-party серверов. AWS имеет 66 официальных MCP-серверов, покрывающих каждую major службу (CloudWatch, DynamoDB, S3, Lambda, Cost Explorer, EKS). Anthropic поддерживает серверы для PostgreSQL, GitHub, Slack и Google Drive. MCP экосистема имеет 10,000+ published серверов.

Пишите свой, когда second-party сервер не fit вашему domain. Я написал QMD MCP, потому что мой Obsidian vault имеет custom структуру — projects, clients, certifications, knowledge base — и generic "filesystem" MCP-сервер не мог навигировать его intelligently. Мне нужен был semantic search (BM25 + vector embeddings) по моим notes. Это 200 строк Python. Теперь Claude может отвечать на вопросы типа "Что я узнал из Salesforce Karpenter migration?" с citations к specific vault notes.

Если вы подключаетесь к proprietary internal API — вашему CMDB, вашей ticketing системе, вашему deployment pipeline — вам нужен custom MCP-сервер. Протокол простой. Сложная часть — сделать интеграцию useful. Tool, который возвращает 10,000 строк JSON, хуже, чем отсутствие tool вообще. Проектируйте ваш MCP-сервер так, чтобы он возвращал *useful* slices данных, а не database dumps.

## Куда это идёт

MCP движется от IDE integrations к production agents. Bedrock AgentCore (AWS managed agent runtime) поддерживает MCP tools natively. Strands (AWS agent SDK) использует MCP как tool interface. Тот же MCP-сервер, который вы используете в Claude Code, может работать в production agent, который обрабатывает 10,000 requests в секунду.

Этот shift — от dev tool к production runtime — меняет то, что важно. Tool latency важна. Tool reliability важна. Tool observability важна. MCP-сервер, который fine для interactive IDE use, может быть слишком медленным или слишком brittle для production agent loop, который retries failed tool calls с exponential backoff.

Если вы создаёте MCP-серверы для production agents, инструментируйте их. Логируйте каждый tool call. Export metrics (call count, latency, error rate). Используйте structured tool responses, чтобы agent мог parse failures чисто. И тестируйте ваш сервер под load — agents вызывают tools параллельно, и ваш сервер должен handle concurrent requests без падения.

## Контракт

MCP — это открытый стандарт. Anthropic передали его Linux Foundation в декабре 2025. AWS, OpenAI и Anthropic — co-founders governing body. Спецификация публична. SDK open-source.

Вот в чём смысл. Один MCP-сервер работает в Claude Code, OpenCode, Cursor, Zed и любой другой IDE, которая implements протокол. Вы создаёте сервер один раз. Он работает везде.

Если вы когда-либо создавали integrations для 5 разных AI tools, вы знаете, почему это важно.

## Связанные материалы

- AWS Summit Warsaw 2026 (DOP202): *Integrated AI Agents & Code Assistants with MCP & AWS* — предстоящий chalk talk, 2026-05-06
- Спецификация MCP от Anthropic: https://modelcontextprotocol.io (внешний ресурс)
