CREATE TABLE scrolls.stake_address_state (
    id SERIAL8 PRIMARY KEY UNIQUE,
    bech32 VARCHAR NOT NULL UNIQUE,
    raw BYTEA NOT NULL,
    balance BIGINT NOT NULL,
    utxo_count BIGINT NOT NULL,
    tx_count BIGINT NOT NULL,
    tx_count_as_source BIGINT NOT NULL,
    tx_count_as_dest BIGINT NOT NULL,
    first_tx_time TIMESTAMPTZ NOT NULL,
    last_tx_time TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_stake_address_state_bech32 ON scrolls.stake_address_state(bech32);

CREATE TABLE scrolls.address_state (
    id SERIAL8 PRIMARY KEY UNIQUE,
    bech32 VARCHAR NOT NULL UNIQUE,
    raw BYTEA NOT NULL,
    stake_address_id BIGINT REFERENCES scrolls.stake_address_state(id),
    balance BIGINT NOT NULL,
    utxo_count BIGINT NOT NULL,
    tx_count BIGINT NOT NULL,
    tx_count_as_source BIGINT NOT NULL,
    tx_count_as_dest BIGINT NOT NULL,
    first_tx_time TIMESTAMPTZ NOT NULL,
    last_tx_time TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_address_state_bech32 ON scrolls.address_state(bech32);