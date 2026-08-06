# Agent Instructions

Use Domain-Driven Design (DDD).

- `infrastructure/` contains all framework and integration code, including Fastify, HTTP, Drizzle, PostgreSQL, and RabbitMQ.
- Domain and application code must not depend on infrastructure.
- Do not import another module's `domain/`, `application/`, or `infrastructure/`. Coordinate through events or dispatchers
- Do not use dependency injections/ports/interfaces. Just import an already created insteance of a repostirory for example.
- Never stage changes or otherwise modify the Git index. Do not run `git add`, `git rm --cached`, or other index-changing commands unless the user explicitly asks.
- Do not create `toX` mapping functions. Pass raw data directly to an entity or value object constructor at the point of use.
- Do not create separate `.dtos.ts` files. Define request and response types directly in the handler or router where they are used.
- In handlers and routers, inline types with only one or two properties instead of declaring a separate named type.

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
