---
title: "Move beyond reactive: AWS DevOps Agent"
event: "AWS Summit Hamburg"
city: "Hamburg"
date: 2026-05-20
tags: ["AI Agents", "AWS", "DevOps", "SRE", "Observability"]
draft: false
---

What AWS DevOps Agent actually is and where it fits: an autonomous teammate, not a chatbot. The talk opens with the 2 AM page. Without the agent: five tabs and half an hour of context switching before the first hypothesis. With the agent on the same alert: by the time the laptop is open, the topology is walked, the root cause is written up, a mitigation plan with a revert path sits next to the ticket, and the team channel already has the context. Nothing runs on its own; the engineer stays in the loop. Then the three modes grouped by trigger (autonomous incident response, proactive prevention, on-demand chat), the five sub-agents underneath (Triage, RCA, Mitigation, Evaluation, On-demand), and an honest comparison with a do-it-yourself setup such as Claude Code plus MCP: a shared agent earns its keep at the team layer, with persistent topology across accounts, accumulated skills, one IAM model and an immutable journal of every reasoning step. The questions that kept coming back from the room: how to plug an agent into a fleet of accounts (a workspace per account, or per environment for tighter isolation), how to teach it your own skills, and how to connect it to internal data and tools through MCP.

Session COP301 at [AWS Summit Hamburg 2026](https://aws.amazon.com/events/summits/hamburg/) on 20 May 2026, co-presented with [Sergey Kurson](https://www.linkedin.com/in/sergey-kurson/), Principal Solutions Architect at AWS. A short recap of the day is on [LinkedIn](https://www.linkedin.com/posts/vedmich_awssummit-awssummithamburg-devopsagent-activity-7464586213694431232-f6Gh).
