---
title: "Building an AWS solutions architect agent with Amazon Bedrock"
event: "AWS Summit Berlin"
city: "Berlin"
date: 2024-05-15
tags: ["AI Agents", "AWS", "Bedrock", "GenAI", "IaC"]
video: "https://www.youtube.com/watch?v=8ftKjZyaqNk"
draft: false
---

Navigating complex cloud solutions takes time, so we built a generative AI agent that does the solutions architect's legwork. With Amazon Bedrock Agents it queries the AWS documentation, generates infrastructure code and draws architecture diagrams. In the live demo the agent took a plain request (a standard Magento e-commerce stack for a given load, highly available and with disaster recovery), wrote the Terraform code for it and estimated the cost of the solution from that code. The session ends with the agent working through several such tasks and with the practical know-how to build a similar agent for your own pain points.

Session BOA305 at AWS Summit Berlin 2024, delivered twice on 15 and 16 May 2024. Co-presented with Viktoria Semaan, Senior Developer Advocate at AWS, who gave the first version of this talk at re:Invent 2023 ([BOA306](https://youtu.be/kzzlchi0DzU)). The Berlin recording is on [YouTube](https://youtu.be/8ftKjZyaqNk). The demo code is in [amazon-bedrock-agents-quickstart](https://github.com/build-on-aws/amazon-bedrock-agents-quickstart), with a write-up on [community.aws](https://community.aws/content/2ddc0z5vdtEzV8dW9Mib2HPxPgB/building-agent-aws).
