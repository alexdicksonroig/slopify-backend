# Agent Instructions

Use Domain-Driven Design (DDD).

- `infrastructure/` contains all framework and integration code, including Fastify, HTTP, Drizzle, PostgreSQL, and RabbitMQ.
- Domain and application code must not depend on infrastructure.
- Do not import another module's `domain/`, `application/`, or `infrastructure/`. Coordinate through events or dispatchers
- Do not use dependency injections/ports/interfaces. Just import an already created insteance of a repostirory for example.

- Entity → `domain/<concept>.entity.ts`
- Value object → `domain/<concept>.value-object.ts`
- Do not create value objects for simple values that contain little or no domain logic; use the underlying primitive type instead.
- Use case → `application/<action>.use-case.ts`
- DTO → `infrastructure/api/<module>-<surface>.dtos.ts`
- HTTP handler → `infrastructure/api/<module>-<surface>.handler.ts`
- Fastify router → `infrastructure/api/<module>-<surface>.router.ts`
- Fastify hook/decorator → `infrastructure/api/<module>-<capability>.adapter.ts`
- Concrete repository → `infrastructure/persistence/<module>.repository.ts`
- Event class → `domain/<event-name>.event.ts`
- Event publisher → `infrastructure/<module>-events.publisher.ts`
- Event subscriber → `infrastructure/<event>.subscriber.ts`
- Dispatcher → `infrastructure/dispatchers/<name>.dispatcher.ts`
- Interval → `infrastructure/scheduling/<name>.interval.ts`
- External API/SDK translation/ utils file → `infrastructure/<thing>.adapter.ts`
- Stateful objects → `infrastructure/<thing>.factory.ts`
