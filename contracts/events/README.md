# Event Contracts

`common.schema.json` defines the transport-neutral event envelope only. No domain event payload, broker, queue, topic, webhook, outbox implementation, or delivery guarantee is implemented yet.

Every future event needs its own versioned payload schema, synthetic example, producer and consumer ownership, privacy classification, ordering policy, idempotency behaviour, and compatibility tests.
