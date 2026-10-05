---
title: "Latency optimization: From theory to practice"
event: "AWS re:Invent"
city: "Las Vegas"
date: 2024-12-05
tags: ["Latency", "Networking", "Observability", "Architecture", "AWS"]
draft: false
---

A chalk talk for people who build or run latency-sensitive systems. It starts with the definition: network latency and the latency users actually perceive are two different things, and the second one shows up directly as lost conversion and engagement. Then the use cases that shape design decisions on AWS: trading, payment processing with its hard SLAs, core banking, hybrid applications, media streaming and betting. The main part goes layer by layer through the services between a user and the backend (edge, routing, compute, storage, databases) and the design choices and settings we recommend when every millisecond counts. It closes with how to measure latency and a demo of AWS observability tools (CloudWatch, X-Ray, Application Signals) for finding the bottleneck. The format is deliberately simple: mental models and ready-to-use checklists instead of a service tour.

Session DEV327, a chalk talk at [AWS re:Invent 2024](https://reinvent.awsevents.com/) in Las Vegas on 5 December 2024, co-presented with [Igor Ivaniuk](https://www.linkedin.com/in/igorivaniuk/) (AWS). There is no public recording of this chalk talk.
