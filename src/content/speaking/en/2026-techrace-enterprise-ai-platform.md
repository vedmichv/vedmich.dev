---
title: "Building the Production-Grade Platform for Enterprise AI"
event: "Tech Race Summit"
city: "Warsaw"
date: 2026-09-10
tags: ["AI", "Agents", "AWS", "AgentCore", "Platform Engineering"]
draft: false
---

What happens when your first AI agent becomes five hundred, and how to build a platform that keeps them safe and fast to ship. [Sergey Kurson](https://www.linkedin.com/in/sergey-kurson/) opened with why agent platforms matter now (agent sprawl, shadow AI, integration chaos, cost blindness), the build, deploy and operate stack on open protocols (MCP, A2A, OpenTelemetry), a four-level platform maturity model and the federated operating model.

My part was the deep dive, framed as three questions for every agent in production: can you control it, can you see it, can you change it. The controls live outside the agent. A governance plane declares policy: Cedar with default-deny, an identity per agent, and a registry as the only path to credentials. An enforcement plane applies it on every request through four stop points: inbound gateway, guardrails, human-in-the-loop and outbound gateway. Then observability at the level of the whole agent trajectory, offline, on-demand and online evaluation, agent CI/CD where the artifact is code, prompts, model version, tool schemas, policy and state, and the platform side: hard budgets, per-agent cost attribution and tenant isolation down to the vector store.

Co-presented with [Sergey Kurson](https://www.linkedin.com/in/sergey-kurson/), Principal Solutions Architect at AWS, on Stage 2 (Solution Track) of the first [Tech Race Summit](https://techracesummit.com/) by [SOFTSWISS](https://www.softswiss.com/) at [Centrum Praskie Koneser](https://koneser.eu/), Warsaw.
