# Builder stage for Go code
FROM golang:1.19-bullseye AS builder
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=/root/.cache/go-build \
    go install github.com/vektra/mockery/v2@v2.14.0 \
    && go install github.com/swaggo/swag/cmd/swag@v1.8.4 \
    && make all

# Final image
FROM python:3.9.9-slim-bullseye AS base
ENV PYTHONUNBUFFERED=1
RUN apt-get update && apt-get install -y \
    tar curl libssh2-1 zlib1g libffi-dev default-libmysqlclient-dev libpq-dev build-essential \
    && apt-get clean \
    && rm -fr /usr/share/doc/* /usr/share/info/* /usr/share/linda/* /usr/share/lintian/overrides/* /usr/share/locale/* /usr/share/man/* /usr/share/doc/kde/HTML/* /usr/share/gnome/help/* /usr/share/locale/* /usr/share/omf/*/*-*.emf /var/lib/apt/lists/*
EXPOSE 8080
WORKDIR /app
COPY python/ /app/python/
RUN python3 -m pip install --no-cache --upgrade pip setuptools \
    && python3 -m pip install --no-cache -r python/requirements.txt \
    && rm -fr /usr/share/python-wheels/*
RUN curl -sSL https://install.python-poetry.org | python3 -
RUN ln -sf /root/.local/bin/poetry /usr/local/bin
RUN find /app/python/ -name "*.sh" | xargs -I{} chmod +x {}
RUN /app/python/build.sh

# Final image with optimized build artifacts
FROM base AS devlake-base
ENV LD_LIBRARY_PATH=/app/libs
RUN mkdir -p /app/libs
COPY --from=builder /app/bin /app/bin
COPY --from=builder /app/resources /app/resources
ENV PATH="/app/bin:${PATH}"
RUN apt-get update && apt-get install -y tini
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["lake"]
