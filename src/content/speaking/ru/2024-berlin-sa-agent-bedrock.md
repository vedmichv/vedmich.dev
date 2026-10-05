---
title: "Building an AWS solutions architect agent with Amazon Bedrock"
event: "AWS Summit Berlin"
city: "Berlin"
date: 2024-05-15
tags: ["AI Agents", "AWS", "Bedrock", "GenAI", "IaC"]
video: "https://www.youtube.com/watch?v=8ftKjZyaqNk"
draft: false
---

Разбираться в сложных облачных решениях долго, поэтому мы собрали генеративного агента, который берёт на себя рутину архитектора. На Amazon Bedrock Agents он ищет ответы в документации AWS, генерирует код инфраструктуры и рисует архитектурные диаграммы. В живом демо агент получил обычный запрос (стандартный стек интернет-магазина на Magento под заданную нагрузку, с высокой доступностью и аварийным восстановлением), написал под него Terraform и оценил стоимость решения по этому коду. В финале агент решает несколько таких задач подряд, а слушатели уносят рецепт, как собрать похожего агента под свою боль.

Сессия BOA305 на AWS Summit Berlin 2024, доклад прошёл дважды, 15 и 16 мая 2024. Совместный доклад с Викторией Семаан, Senior Developer Advocate в AWS: первую версию этого доклада она читала на re:Invent 2023 ([BOA306](https://youtu.be/kzzlchi0DzU)). Запись из Берлина есть на [YouTube](https://youtu.be/8ftKjZyaqNk). Код демо лежит в [amazon-bedrock-agents-quickstart](https://github.com/build-on-aws/amazon-bedrock-agents-quickstart), разбор есть в [статье на community.aws](https://community.aws/content/2ddc0z5vdtEzV8dW9Mib2HPxPgB/building-agent-aws).
