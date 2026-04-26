---
title: "MCP servers, plainly explained"
description: "What a Model Context Protocol server actually does — and the difference between AWS Knowledge MCP and AWS Documentation MCP."
date: 2026-03-02
tags: ["ai", "mcp", "agents"]
---

An MCP server is a tiny program that teaches your AI agent one new skill — read these docs, query this database, run that CLI. Anthropic's Model Context Protocol is the contract that keeps them pluggable.

Before MCP, every AI tool had its own plugin system. Cursor plugins didn't work in GitHub Copilot. Claude integrations didn't work in Zed. If you built a tool that let Claude query your PostgreSQL database, you couldn't reuse it in any other IDE without rewriting the whole thing.

MCP is the USB-C for AI. One server, every tool.

## The shape of it

An MCP server exposes capabilities. The client — your IDE, your agent framework, your chatbot — connects to the server over JSON-RPC and asks: what can you do?

The server replies with a list of tools. Each tool has a name, a description, and a schema. The client passes the tools to the language model. When the model decides to use a tool, the client calls the server. The server executes the tool and returns a result. The client sends that result back to the model.

```
[ Client: Claude Code ]  ←→  [ MCP Server ]  ←→  [ External resource: docs / DB / API ]
```

The client is the orchestrator. The server is the integration layer. The model is the brain that decides which tools to call.

Here's what makes MCP different from earlier tool protocols: it's bidirectional, stateful, and transport-agnostic. The server can push resources to the client (e.g., "here are the 5 most recent files you edited"), not just respond to calls. The server can hold state across tool calls (e.g., maintain a database connection pool). And the transport can be stdio, HTTP, or WebSocket — MCP doesn't care.

## Three concrete servers I use

**AWS Documentation MCP** searches AWS service documentation. I ask Claude: "What are the VPC flow log fields?" Claude calls the AWS Documentation MCP server with the query `VPC flow log fields`. The server hits the AWS docs search API, returns the top 3 results. Claude reads them and answers my question with real, current documentation instead of training-data knowledge that might be two years stale.

**AWS Knowledge MCP** searches AWS re:Post, blog posts, and whitepapers. It's like AWS Documentation MCP, but broader — it covers community discussions and real-world patterns, not just API reference docs. I use it when I'm troubleshooting. "Why does my Lambda cold start take 8 seconds?" AWS Knowledge MCP finds a re:Post thread where someone hit the same issue with VPC-attached Lambdas and large deployment packages.

**QMD MCP** (Quantum Memory Disk) searches my Obsidian vault. My vault has 5 years of architecture notes, client engagements (anonymized), and Kubernetes troubleshooting sessions. I ask Claude: "Show me notes on Karpenter consolidation." QMD MCP returns 3 vault notes. Claude synthesizes them into an answer that's grounded in my own experience, not generic training data.

The pattern: each server is a thin wrapper around a data source. The server doesn't do the intelligence — the model does. The server just fetches.

## What "plainly" means here

MCP servers are not magic. They're just JSON-RPC APIs with a schema contract.

If the underlying data source is wrong, the server returns wrong results. If your documentation is outdated, AWS Documentation MCP will give you outdated answers. If your database has bad data, your MCP server will surface bad data. The model trusts the tools. You have to trust the servers.

Authentication still matters. AWS MCP servers use IAM credentials or OAuth tokens. If you expose an MCP server over HTTP, you need to authenticate the client. If you run an MCP server locally via stdio, the client inherits your shell permissions. I've seen developers accidentally give Claude write access to their production database because they forgot the MCP server was running with their DBA credentials.

Context rot is real. If you load 60 MCP servers into Claude at startup, you burn 10,000+ tokens just listing the tool definitions. The model sees all 60 tools, but it can only reason over the ones that fit in context. AWS Kiro (the next-gen AI IDE) solves this with "Powers" — dynamic tool loading based on what the model is working on. You don't load all 60 AWS MCP servers. You load the 3 that are relevant to the current file.

## When to write your own

Start with first-party servers. AWS has 66 official MCP servers covering every major service (CloudWatch, DynamoDB, S3, Lambda, Cost Explorer, EKS). Anthropic maintains servers for PostgreSQL, GitHub, Slack, and Google Drive. The MCP ecosystem has 10,000+ published servers.

Write your own when the second-party server doesn't fit your domain. I wrote QMD MCP because my Obsidian vault has a custom structure — projects, clients, certifications, knowledge base — and the generic "filesystem" MCP server couldn't navigate it intelligently. I needed semantic search (BM25 + vector embeddings) over my notes. That's 200 lines of Python. Now Claude can answer questions like "What did I learn from the Salesforce Karpenter migration?" with citations to specific vault notes.

If you're connecting to a proprietary internal API — your CMDB, your ticketing system, your deployment pipeline — you'll need a custom MCP server. The protocol is simple. The hard part is making the integration useful. A tool that returns 10,000 rows of JSON is worse than no tool at all. Design your MCP server to return *useful* slices of data, not database dumps.

## Where this is going

MCP is moving from IDE integrations to production agents. Bedrock AgentCore (AWS's managed agent runtime) supports MCP tools natively. Strands (AWS's agent SDK) uses MCP as the tool interface. The same MCP server you use in Claude Code can run in a production agent that processes 10,000 requests per second.

That shift — from dev tool to production runtime — changes what matters. Tool latency matters. Tool reliability matters. Tool observability matters. An MCP server that's fine for interactive IDE use might be too slow or too brittle for a production agent loop that retries failed tool calls with exponential backoff.

If you're building MCP servers for production agents, instrument them. Log every tool call. Export metrics (call count, latency, error rate). Use structured tool responses so the agent can parse failures cleanly. And test your server under load — agents call tools in parallel, and your server needs to handle concurrent requests without falling over.

## The contract

MCP is an open standard. Anthropic donated it to the Linux Foundation in December 2025. AWS, OpenAI, and Anthropic are co-founders of the governing body. The spec is public. The SDKs are open-source.

That's the point. One MCP server works in Claude Code, OpenCode, Cursor, Zed, and any other IDE that implements the protocol. You build the server once. It works everywhere.

If you've ever built integrations for 5 different AI tools, you know why that matters.

## Related

- AWS Summit Warsaw 2026 (DOP202): *Integrated AI Agents & Code Assistants with MCP & AWS* — upcoming chalk talk, 2026-05-06
- Anthropic's MCP specification: https://modelcontextprotocol.io (external, canonical)
