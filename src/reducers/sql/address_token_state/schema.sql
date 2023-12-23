CREATE TABLE scrolls.address_token_state (
    id SERIAL8 PRIMARY KEY UNIQUE,
    address_id BIGINT NOT NULL,
    token_id BIGINT NOT NULL,
    balance BIGINT NOT NULL,
    tx_count BIGINT NOT NULL
);

CREATE TABLE scrolls.stake_address_token_state (
    id SERIAL8 PRIMARY KEY UNIQUE,
    stake_address_id BIGINT NOT NULL,
    token_id BIGINT NOT NULL,
    balance BIGINT NOT NULL,
    tx_count BIGINT NOT NULL
);