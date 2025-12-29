ARG UV_VERSION='0.6.2'
FROM ghcr.io/astral-sh/uv:${UV_VERSION} AS uv_source

FROM python:3.12-slim-bullseye AS base

COPY --from=uv_source /uv /uvx /bin/

FROM base AS builder

COPY docker/requirements-os-build.txt /build/requirements-os-build.txt

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    --mount=type=bind,source=/docker/requirements-os-build.txt,target=/build/requirements-os-build.txt \
    apt-get -y update && \
    apt-get install -y --no-install-recommends $(grep -v '^#' /build/requirements-os-build.txt)

WORKDIR /deps
ENV UV_LINK_MODE=copy
ARG DEV=false
COPY app/uv.lock* /deps
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=app/pyproject.toml,target=pyproject.toml \
    --mount=type=secret,id=pypy_username \
    --mount=type=secret,id=pypi_token \
    if [ "$DEV" = "true" ]; then \
        uv sync --compile-bytecode --dev; \
    else \
        uv sync --frozen --compile-bytecode; \
    fi

FROM base
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    --mount=type=bind,source=/docker/requirements-os-runtime.txt,target=/build/requirements-os-runtime.txt \
    apt-get -y update && \
    apt-get install -y --no-install-recommends $(grep -v '^#' /build/requirements-os-runtime.txt) && \
    apt-get -y --purge autoremove && \
    apt-get -y autoclean && \
    apt-get -y clean
WORKDIR /app
COPY --from=builder /deps/.venv /deps/.venv
COPY app /app
ENV PATH="/deps/.venv/bin:$PATH"

CMD ["fastapi", "run", "app/main.py", "--port", "8080", "--proxy-headers", "--forwarded-allow-ips=*"]
