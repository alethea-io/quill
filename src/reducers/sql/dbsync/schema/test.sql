CREATE TABLE block (
    id SERIAL8 PRIMARY KEY,
    hash hash32type NOT NULL,
    slot_no word31type NULL,
    time timestamp NOT NULL
);


CREATE TABLE tx (
    id SERIAL8 PRIMARY KEY,
    hash hash32type NOT NULL,
    block_id INT8 NOT NULL REFERENCES block(id),
    block_index word31type NOT NULL,
    out_sum lovelace NOT NULL,
    fee lovelace NOT NULL,
    valid_contract BOOLEAN NOT NULL
);


CREATE TABLE tx_out (
    id SERIAL8 PRIMARY KEY,
    tx_id INT8 NOT NULL REFERENCES tx(id),
    index txindex NOT NULL,
    address VARCHAR NOT NULL,
    value lovelace NOT NULL
);
