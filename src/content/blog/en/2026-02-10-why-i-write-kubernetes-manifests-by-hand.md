---
title: "Why I still write Kubernetes manifests by hand"
description: "Helm and Kustomize are great tools, but I don't start with them. Why, and where that rule stops working."
date: 2026-02-10
tags: ["kubernetes", "opinion"]
---

Most of my Kubernetes work starts the same way: a folder of raw manifests and `kubectl apply -f`. No chart, no overlays. The obvious question: why not just use Helm? Here's why, and where that answer stops being true.

## Debuggability

Raw manifests are easy to grep, diff, and paste into Slack. When something breaks at 2am, I don't want to dig through three layers of templating to find which value override produced the broken YAML.

A typical Helm failure: a nested `include` pulls a value from a parent chart's dependency, and the parse error points at a rendered line that exists in no template you can open. `helm template --debug` shows the rendered output even when it fails to parse. Mapping it back to the source is still on you.

Git diffs stay honest, too. `git diff` on a manifest shows the field that changed. On a chart, the diff shows changed values or a changed Go template, and to see what changes in the actual resources, the reviewer has to render the chart first.

Here's the catch, though: raw YAML is not what runs in the cluster either. It removes template rendering, not the API server. Defaulting fills in fields your file never set. Mutating admission can add tolerations, default resource requests from a LimitRange, or a service mesh sidecar. Controllers keep writing status, revision annotations, and autoscaler replica counts. So when debugging, look at the live Deployment, the Pods it creates, and the warning events:

```bash
# what would change if you applied the file right now
kubectl diff -f deployment.yaml
# the live object, after defaulting and admission
kubectl get deployment web -o yaml
# the Pods it created: LimitRange defaults and sidecars land here
kubectl get pods -l app=web -o yaml
# rejections and other warnings
kubectl events --types=Warning
```

With raw YAML, that is the only gap. With a chart, there are two: values versus rendered output, then rendered output versus live.

## Staying fluent in the API

Writing manifests by hand keeps the API in my head. I know which fields a Deployment has because I've typed them many times. I know how `strategy.type: RollingUpdate` differs from `strategy.type: Recreate` because I've watched both roll out. Abstractions break eventually, and when they do, I can still reason about what goes to the API server. Helm generates YAML. If you don't understand that YAML, you're debugging blind.

A common pattern: engineers who learned Kubernetes through Helm freeze on a cluster where nothing is templated. They can edit `values.yaml`, but can't explain why a Deployment in a namespace labeled `pod-security.kubernetes.io/enforce: restricted` never gets its Pods, or what their ServiceAccount is allowed to do. The abstraction became their ceiling instead of their floor.

Both answers are short once you know the API. Pod Security Admission replaced PodSecurityPolicy, which was removed in Kubernetes 1.25. In `enforce` mode it rejects the noncompliant Pods, not the Deployment, so the rejection shows up in the ReplicaSet events (the `warn` and `audit` modes do flag the Deployment's Pod template). With default RBAC, a ServiceAccount can discover the API and inspect its own identity and permissions, nothing more. Access to Pods or Secrets needs a RoleBinding or ClusterRoleBinding for the account or one of its groups. An app that never calls the API needs no binding just to run. That knowledge works on every cluster. Knowing one chart's values works with that chart.

## The abstraction tax

For a small service, a chart adds more cognitive overhead than the service itself. A three-file app (Deployment, Service, HTTPRoute) becomes `Chart.yaml`, `values.yaml`, `_helpers.tpl`, and a `templates/` folder. `helm create` alone scaffolds a dozen files. For one service in one environment, you pay the tax (template language, release lifecycle, chart versioning), and release history with `helm rollback` rarely pays it back.

Kustomize overlays aren't free either. In a four-layer stack (base, cluster, namespace, app), you open four directories to find out why an annotation sits on the final object. Elegant on a whiteboard, opaque at 2am.

The tax pays off when configurations really differ at scale: many environments, many services, a platform team running shared infrastructure. On a small fleet where everything looks alike, it doesn't.

## When Helm is worth it

Many services of the same shape call for templating. Nobody wants to copy a hundred Deployments and bump image tags by hand. Helm gives you parameters, versioned charts, and `helm rollback`. Here the tax is cheaper than a hundred manifest sets maintained by hand.

The other case is packaged software. A team needs a database or a monitoring stack running and doesn't want to start with the StatefulSet docs. A maintained chart packages someone else's operational knowledge. That's real value for people who don't live in Kubernetes every day.

## My rule of thumb

Start with raw YAML. My personal threshold for moving past it is roughly five environments or ten services. That's a rule of thumb from my own work, not a law: the real signal is how much your configuration varies and how often it changes.

If environments differ by small tweaks to a shared base (an image registry, a storage class, a replica count), Kustomize is the natural middle ground: still raw YAML plus patches, built into kubectl as `kubectl apply -k`. If you need real parameters or want to version deployments as artifacts, Helm earns its place. Either way, keep it boring. In Helm, put what varies into values and keep the template logic simple. The goal is one place to change the image tag, not a Turing-complete configuration language.

## The real question

The real question isn't "Helm or raw manifests?" It's "what level of abstraction fits my team's scale and skills?"

A solo developer with two services ships faster with raw manifests than by learning Helm. A platform team with fifty microservices across ten environments will almost certainly want templating or overlays: Helm, Kustomize, or both. But scale alone doesn't pick the tool. Configuration variation, packaging needs, and the way the team works do.

I write manifests by hand because most of my work sits at the small end: demos, proof-of-concept clusters, troubleshooting sessions where I need to see exactly what was applied. There, Helm would slow me down more than it speeds me up.

Your setup may be different. Pick the level of abstraction you can still debug at 2am.
