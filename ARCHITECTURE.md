# Architecture Notes

## Ingestion flow

```
┌─────────────┐     POST /api/logs/ingest      ┌──────────────────┐
│  LLMLogger  │ ─────────────────────────────► │ Ingestion API    │
│  (SDK)      │     (near real-time, 202)      │ validate (Zod)   │
└─────────────┘                                │ PII redact       │
       │ fallback on failure                   └────────┬─────────┘
       └──────────────────────────────────────────────►│
                                                       ▼
                                              ┌──────────────────┐
                                              │  eventQueue      │
                                              │  (EventEmitter)  │
                                              └────────┬─────────┘
                                                       ▼
                                              ┌──────────────────┐
                                              │ pipeline.ingest  │
                                              │ → MongoDB        │
                                              └──────────────────┘
```

1. Chat handler calls a foundation model through `LLMLogger.wrapCall()`.
2. SDK captures metadata (model, provider, latency, tokens, timestamps, status, session/conversation IDs, previews).
3. SDK **POSTs to `/api/logs/ingest`** (assignment requirement). On failure, falls back to in-process queue.
4. Ingestion validates payload, redacts PII in previews, emits to worker queue, persists asynchronously.
5. Assistant `messageId` is linked to the latest log after the message row is created.

## Logging strategy

| Concern | Approach |
|--------|----------|
| **Non-blocking** | HTTP ingest returns `202 Accepted`; DB write runs in background worker |
| **Previews vs full text** | Store 300-char redacted previews only; full messages in `messages` table |
| **PII** | Regex redaction before persistence (email, phone, card, SSN) |
| **Correlation** | `conversationId`, `sessionId`, optional `messageId` on each log |
| **Streaming** | Time-to-first-token tracked separately from total latency |
| **Errors** | Failed LLM calls still emit logs with `status: error` |

## Event-based architecture

- `EventEmitter` decouples HTTP request lifecycle from DB writes.
- Multiple producers (HTTP ingest, SDK fallback) can emit the same `log` event shape.
- Worker swallows ingestion errors so chat never crashes on logging failures.

## Scaling considerations

| Component | Scale path |
|-----------|------------|
| **API** | Horizontally scale stateless Express pods behind a load balancer |
| **Ingestion queue** | Replace in-process `EventEmitter` with Redis Streams / SQS / Kafka |
| **Database** | Read replicas for dashboards; partition `inference_logs` by `created_at` at high volume |
| **Chat streaming** | Sticky sessions or shared abort/cancel state in Redis |

## Failure handling assumptions

- Ingestion failures are **logged and dropped** (no retry queue in MVP).
- SDK retries via in-process queue if HTTP ingest is unreachable.
- Invalid payloads return `400` from ingest endpoint (Zod validation).
- DB unavailable: chat may succeed but logs may be lost (acceptable for demo; production needs durable queue).
- Cancel: in-memory `AbortController` map per instance (multi-instance cancel needs shared state).

## Schema design (summary)

- **`conversations`**: session + provider + model + status (user-facing thread).
- **`messages`**: full chat content (user/assistant/system).
- **`inference_logs`**: observability metadata, decoupled from messages for analytics.

See README for tradeoffs and future improvements.

## Kubernetes (self-hosted)

Manifests in `k8s/` deploy Postgres, backend, and frontend. See `k8s/README.md`.
