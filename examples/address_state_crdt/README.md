## Setup Redis DB
```bash
docker compose up -d
```

## Run scrolls
```bash
SCROLLS_DIR=/home/aleksandar/Projects/scrolls
${SCROLLS_DIR}/target/debug/scrolls daemon --config ./daemon.toml
```