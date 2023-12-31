CREATE TABLE scrolls.address_token_state (
    id SERIAL8 PRIMARY KEY,
    address_id BIGINT NOT NULL REFERENCES scrolls.address_state(id),
    token_id BIGINT NOT NULL REFERENCES scrolls.token_state(id),
    balance NUMERIC NOT NULL,
    first_tx_time TIMESTAMPTZ NOT NULL,
    last_tx_time TIMESTAMPTZ NOT NULL,
    UNIQUE (address_id, token_id)
);

CREATE TABLE scrolls.stake_address_token_state (
    id SERIAL8 PRIMARY KEY,
    address_id BIGINT NOT NULL REFERENCES scrolls.stake_address_state(id),
    token_id BIGINT NOT NULL REFERENCES scrolls.token_state(id),
    balance NUMERIC NOT NULL,
    first_tx_time TIMESTAMPTZ NOT NULL,
    last_tx_time TIMESTAMPTZ NOT NULL,
    UNIQUE (address_id, token_id)
);