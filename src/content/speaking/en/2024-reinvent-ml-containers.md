---
title: "Scaling machine learning with containers on AWS: Lessons learned"
event: "AWS re:Invent"
city: "Las Vegas"
date: 2024-12-04
tags: ["Machine Learning", "Containers", "Serverless", "SageMaker", "AWS"]
draft: false
---

How Instrumental, a manufacturing optimization platform, runs machine learning in production at scale on serverless containers: tens of thousands of training jobs a month, tens of millions of predictions, and research iterations that take days instead of weeks. Rustem told the story of the platform, the usual ML project lifecycle and the migration itself. My part covered the container options on AWS for ML workloads, the lessons learned along the way, and a demo of launching training jobs at scale with Amazon SageMaker (in batches, on Spot capacity) with AWS Lambda serving predictions. The takeaway is a serverless approach to MLOps that works for both internal and external users.

Session DEV317, a breakout at [AWS re:Invent 2024](https://reinvent.awsevents.com/) in Las Vegas on 4 December 2024, co-presented with [Rustem Feyzkhanov](https://www.linkedin.com/in/ryfeus/), Staff Machine Learning Engineer at Instrumental and AWS Machine Learning Hero.
