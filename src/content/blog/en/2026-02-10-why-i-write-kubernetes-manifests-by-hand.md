---
title: "Why I still write Kubernetes manifests by hand"
description: "Helm and Kustomize are great. Here's why I don't reach for them first."
date: 2026-02-10
tags: ["kubernetes", "opinion"]
---

I have a kubectl apply alias that points at raw YAML files, and it has served me for years. Last month a colleague asked why I don't just use Helm. Here's why.

## Debuggability

Raw manifests are greppable, diffable, pasteable into Slack. When something breaks at 2am, I don't want to trace through three layers of Helm templating to figure out which value override produced the broken YAML that landed in the cluster.

I've spent hours debugging Helm charts where the rendered manifest looked nothing like what I expected because of a nested template include that was pulling values from a parent chart's dependencies. The error message pointed to line 47 of the rendered output, but there was no line 47 in any of the source templates — it was synthesized from five different files.

With raw manifests, what you write is what you get. If the Deployment fails to create Pods, I open the Deployment manifest, read the spec, and see the problem. No rendering step. No "which values.yaml file is actually being used?"

Git diffs are clean. `git diff` on a raw manifest shows exactly what changed — one field, one line. `git diff` on a Helm chart shows changes to Go templates, and you have to mentally render them to understand the actual Kubernetes resource change. Code review gets slower.

## Skill depth

Writing raw manifests keeps me fluent in the underlying API. I know what fields exist on a Deployment because I've typed them dozens of times. I know the difference between `strategy.type: RollingUpdate` and `strategy.type: Recreate` because I've used both and watched the rollout behavior.

When Helm abstractions break — and they do — I can still reason about what's actually being sent to the API server. Helm is a tool that generates YAML. If you don't understand the YAML it generates, you're debugging blind.

I've seen engineers who learned Kubernetes through Helm struggle when they encounter a cluster where nothing is templated. They know how to modify `values.yaml`, but they don't know what a PodSecurityPolicy does or why a ServiceAccount needs a RoleBinding. The abstraction became their ceiling, not their floor.

Raw manifests force you to learn the API. That knowledge transfers to every cluster, every tool, every debugging session. Helm knowledge transfers to other Helm users.

## The abstraction tax

Helm charts for toy services introduce more cognitive overhead than the services they describe. A three-file Kubernetes app (Deployment, Service, Ingress) becomes a Helm chart with templates/, values.yaml, Chart.yaml, _helpers.tpl, and a dozen files of boilerplate.

For a single service with one environment, Helm is overkill. You pay the abstraction tax — learning Helm's templating language, dealing with its release lifecycle, managing its versioning — for no benefit. The YAML is simpler than the Helm chart.

Kustomize overlay stacks can become their own maintenance problem. I've seen four-layer Kustomize hierarchies (base → cluster-level → namespace-level → app-level) where you have to trace through all four layers to understand why a particular annotation exists on the final resource. The composition was elegant in theory. In practice, it was opaque.

Abstractions are expensive. You pay the cost in cognitive load, onboarding time, and debugging complexity. That cost is worth it when you have variation at scale — 10 environments, 100 services, a platform team managing shared infrastructure. It's not worth it for small fleets where the variation is low.

## When I'd use Helm anyway

A 100-service platform team needs templating. You can't copy-paste 100 Deployments and manually update image tags. Helm gives you parameterization, versioning, and rollback. The abstraction tax is justified because the alternative — managing 100 raw manifest sets — is worse.

An ops team that doesn't read YAML daily needs Helm's batteries. They want `helm install postgres bitnami/postgresql` and a running database, not 15 minutes reading the PostgreSQL StatefulSet docs. Helm charts package operational knowledge. That's valuable when you're not a Kubernetes expert.

A multi-cluster GitOps fleet needs Kustomize overlays. When you have 20 clusters in different regions with slightly different configs (image registries, storage classes, ingress controllers), Kustomize lets you define the base once and layer cluster-specific overrides. Clean separation. No copy-paste drift.

## Practical heuristic

Start with raw YAML. If you have fewer than 5 environments and fewer than 10 services, raw manifests are simpler, clearer, and easier to debug.

Move to Helm when you have more than ~5 environments or ~10 services. At that scale, parameterization pays for itself. But keep the Helm charts simple — prefer values over complex templating. The goal is "one place to change the image tag," not "a Turing-complete configuration language."

Move to Kustomize when you need clean overlays without templating. Kustomize is better than Helm for multi-cluster scenarios where each cluster needs small tweaks to a shared base. It's worse than Helm when you need heavy parameterization or you want to package and version your deployments as artifacts.

## The real question

The real question isn't "Helm or raw manifests?" It's "what level of abstraction matches my team's scale and skill?"

If you're a solo developer running two services in one cluster, raw manifests are faster than learning Helm. If you're a platform team managing 50 microservices across 10 environments, Helm is mandatory. If you're somewhere in between, the answer depends on how much variation you have and how often it changes.

I write raw manifests by hand because most of my work is at the small end of that scale — one-off engagements, proof-of-concept clusters, troubleshooting customer setups. The cognitive overhead of Helm would slow me down more than it speeds me up.

Your mileage will vary.
