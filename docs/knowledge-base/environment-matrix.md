# Environment matrix

Date: 2026-09-01

This document summarizes how the repository should be consumed across local,
staging, and production-like environments.

Its goal is to keep deployment inputs explicit so no downstream deployment
repository has to invent ports, secrets, namespaces, image references, or
health endpoints.

## Stable vs variable

The following items should stay stable across environments unless the
application contract explicitly says otherwise:

- repository identity;
- route structure;
- health endpoint paths;
- build/test expectations;
- required runtime capabilities;
- documentation and prompt entry points;
- deployment handoff rules.

The following items are environment-specific and must be supplied by the
deployment contract or release contract:

- image reference strategy;
- runtime command and args, when different from defaults;
- environment variables;
- namespace;
- ingress hostnames and TLS material;
- ports exposed to users or load balancers;
- storage class and persistent volumes;
- external service references;
- secret names and secret keys;
- resource requests and limits;
- rollback rules and success criteria.

## Local

Purpose:

- developer iteration;
- reproducible validation;
- contract verification before promotion.

Characteristics:

- synthetic data only;
- localhost-oriented access;
- minimal external dependencies;
- fast feedback;
- no production authority.

Typical local evidence in this repository:

- `pnpm exec task setup`
- `pnpm build`
- `pnpm exec task test:http`

## Staging

Purpose:

- production-representative acceptance;
- release candidate verification;
- integration checks against approved non-production data.

Characteristics:

- deployment inputs must be explicit and versioned;
- the environment should mirror production as closely as practical;
- only approved synthetic or anonymized data should be used by default;
- release candidates should be immutable and traceable.

The deployment repository should expect the staging contract to specify:

- exact image digest;
- namespace;
- ingress hostnames;
- secret references;
- storage expectations;
- rollback process;
- success gates.

## Production

Purpose:

- public service delivery under explicit human authority.

Characteristics:

- production inputs must be explicit and reviewed;
- immutable image digests are required;
- secret material must be injected, not invented;
- rollback and backup expectations must be documented;
- production approval must be separate from local test success.

The deployment repository should never infer production values from local
defaults.

## Deployment handoff principle

When moving from application repository to deployment repository:

1. identify the app contract;
2. verify the runtime contract is current;
3. confirm the environment tier;
4. pass only documented values;
5. stop if any required input is absent.

This is the mechanism that lets a single deployment system handle multiple
repositories without hand-written assumptions.
