CREATE TABLE scrolls.token_state (
    id SERIAL8 PRIMARY KEY UNIQUE,
    fingerprint VARCHAR NOT NULL UNIQUE,
    policy BYTEA NOT NULL,
    name BYTEA NOT NULL,
    supply NUMERIC NOT NULL,
    utxo_count BIGINT NOT NULL,
    tx_count BIGINT NOT NULL
);