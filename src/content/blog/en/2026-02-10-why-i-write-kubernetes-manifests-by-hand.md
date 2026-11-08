---
title: "Why I still write Kubernetes manifests by hand"
description: "Raw YAML has one gap between your file and the cluster, a chart has two. Why I start without Helm and when I switch: about five environments or ten services."
date: 2026-02-10
tags: ["kubernetes", "opinion"]
---

Most of my Kubernetes work starts the same way: a folder of raw manifests and `kubectl apply -f`. No chart, no overlays. The obvious question is why not just use Helm. The short answer: with raw YAML there is one gap between my file and the live object, and with a chart there are two. Below is why, and where that answer stops being true.

## Raw YAML has one gap to debug, a chart has two

Raw manifests are easy to grep, diff, and paste into Slack. When something breaks at 2am, I don't want to dig through three layers of templating to find which value override produced the broken YAML.

A typical Helm failure: a nested `include` pulls a value from a parent chart's dependency. The parse error then points at a rendered line that exists in no template you can open. `helm template --debug` shows the rendered output even when it fails to parse. Mapping it back to the source is still your job.

Git diffs stay honest, too. `git diff` on a manifest shows the field that changed. On a chart, the diff shows changed values or a changed Go template. To see what changes in the actual resources, the reviewer has to render the chart first.

There is a catch, though: raw YAML is not what runs in the cluster either. It removes template rendering, not the API server. Defaulting fills in fields your file never set. Mutating admission can add `tolerations`, default resource requests from a LimitRange, or a service mesh sidecar. Controllers keep writing status, revision annotations, and autoscaler replica counts. So when debugging, look at the live Deployment, the Pods it creates, and the warning events:

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

<figure class="my-6">
  <img
    src="/blog-assets/2026-02-10-why-i-write-kubernetes-manifests-by-hand/diagrams/two-gaps.svg"
    alt="Two paths to the live object. Raw YAML: your file goes through the API server, which applies defaulting, admission and controllers, so there is one gap. Helm chart: values and templates go through template rendering to rendered YAML, then through the same API server step, so there are two gaps."
    loading="lazy"
    width="320"
    height="620"
    style="max-width: 100%; height: auto; margin-inline: auto;"
  />
  <figcaption class="text-sm text-text-muted mt-2 text-center">The API server gap is the same in both. A chart adds template rendering in front of it.</figcaption>
</figure>

## Staying fluent in the API

Writing manifests by hand keeps the API in my head. I know which fields a Deployment has because I've typed them many times. I know how `strategy.type: RollingUpdate` differs from `strategy.type: Recreate` because I've watched both roll out. Abstractions break eventually, and when they do, I can still reason about what goes to the API server. Helm generates YAML. If you don't understand that YAML, you're debugging blind.

A common pattern: engineers who learned Kubernetes through Helm freeze on a cluster where nothing is templated. They can edit `values.yaml`, but can't explain why a Deployment in a namespace labeled `pod-security.kubernetes.io/enforce: restricted` never gets its Pods, or what their ServiceAccount is allowed to do. The abstraction became their ceiling instead of their floor.

Both answers are short once you know the API. Pod Security Admission replaced PodSecurityPolicy, which was removed in Kubernetes 1.25. In `enforce` mode it rejects the noncompliant Pods, not the Deployment. So the rejection shows up in the ReplicaSet events. (The `warn` and `audit` modes do flag the Deployment's Pod template.)

As for the ServiceAccount: with default RBAC it can discover the API, read non-sensitive cluster information, and inspect its own identity and permissions, nothing more. Access to Pods or Secrets needs a RoleBinding or ClusterRoleBinding for the account or one of its groups. An app that never calls the API needs no binding just to run. That knowledge works on every cluster. Knowing one chart's values works with that chart.

## The abstraction tax on a small service

For a small service, a chart adds more cognitive overhead than the service itself. A three-file app (Deployment, Service, HTTPRoute) becomes `Chart.yaml`, `values.yaml`, `_helpers.tpl`, and a `templates/` folder. `helm create` alone scaffolds a dozen files.

That overhead is the tax. For one service in one environment, the tax is a template language, a release lifecycle, and chart versioning. Release history with `helm rollback` rarely pays it back.

<figure class="my-6">
  <img
    src="/blog-assets/2026-02-10-why-i-write-kubernetes-manifests-by-hand/diagrams/abstraction-tax.svg"
    alt="Raw YAML for a small service is three files: Deployment, Service and HTTPRoute. The same service as a Helm chart is Chart.yaml, values.yaml, _helpers.tpl and a templates folder holding the same three kinds. The chart adds a template language, a release lifecycle and chart versioning."
    loading="lazy"
    width="451"
    height="494"
    style="max-width: 100%; height: auto; margin-inline: auto;"
  />
  <figcaption class="text-sm text-text-muted mt-2 text-center">The same three manifests as raw YAML and as a chart.</figcaption>
</figure>

Kustomize overlays aren't free either. In a four-layer stack (base, cluster, namespace, app), you open four directories to find out why an annotation sits on the final object. Elegant on a whiteboard, opaque at 2am.

The tax pays off when configurations really differ at scale: many environments, many services, a platform team running shared infrastructure. On a small fleet where everything looks alike, it doesn't.

## When Helm is worth it

Many services of the same shape call for templating. Nobody wants to copy a hundred Deployments and bump image tags by hand. Helm gives you parameters, versioned charts, and `helm rollback`. Here the tax is cheaper than a hundred manifest sets maintained by hand.

The other case is packaged software. A team needs a database or a monitoring stack running and doesn't want to start with the StatefulSet docs. A maintained chart packages someone else's operational knowledge. That's real value for people who don't live in Kubernetes every day.

## My rule of thumb for leaving raw YAML

Start with raw YAML. My personal threshold for moving past it is roughly five environments or ten services. That number comes from my own work, not from a law: the real signal is how much your configuration varies and how often it changes.

If environments differ by small tweaks to a shared base (an image registry, a storage class, a replica count), Kustomize is the natural middle ground. It is still raw YAML plus patches, and kubectl has it built in as `kubectl apply -k`. If you need real parameters or want to version deployments as artifacts, Helm earns its place. Either way, keep it boring. In Helm, put what varies into `values.yaml` and keep the template logic simple. The goal is one place to change the image tag, not a Turing-complete configuration language.

## Choosing the level of abstraction

Ask what level of abstraction fits your team's scale and skills.

A solo developer with two services ships faster with raw manifests than by learning Helm. A platform team with fifty microservices across ten environments will almost certainly want templating or overlays: Helm, Kustomize, or both. But scale alone doesn't pick the tool. Configuration variation, packaging needs, and the way the team works do.

I write manifests by hand because most of my work sits at the small end: demos, proof-of-concept clusters, troubleshooting sessions where I need to see exactly what was applied. There, Helm would slow me down more than it speeds me up.

Your setup may be different. Pick the level of abstraction you can still debug at 2am.
