CREATE OR REPLACE FUNCTION insert_block(data JSON)
RETURNS void AS $$
DECLARE
    block_data JSON;
    tx_data JSON;
    output_data JSON;
    output_index INT;
    tx_id INT;
    block_hash hash32type;
    address BYTEA;
BEGIN
    -- Extracting block information
    block_data := data->'header';
    block_hash := decode(block_data->>'hash', 'base64')::hash32type;

    -- Inserting into block table
    INSERT INTO block (hash, slot_no, time)
    VALUES (
        block_hash,
        (block_data->>'slot')::INT,
        CURRENT_TIMESTAMP
    );

    -- Loop through each transaction in the JSON
    FOR tx_data IN SELECT * FROM json_array_elements(data->'body'->'tx')
    LOOP
        -- Insert transaction data into tx table
        INSERT INTO tx (hash, block_id, block_index, out_sum, fee, valid_contract)
        VALUES (
            decode('LoVWokLjbNJU8I1EvhVff+Zsi9HDK27HHb6AmGQAoAM=', 'base64')::hash32type,
            (SELECT id FROM block WHERE hash = block_hash),
            0, -- Example value for block_index
            0, -- Example value for out_sum
            0, -- Example value for fee
            (tx_data->>'successful')::BOOLEAN
        ) RETURNING id INTO tx_id;

        -- Loop through each output in the transaction with its index
        FOR output_index, output_data IN
            SELECT ordinality - 1, value
            FROM json_array_elements(tx_data->'outputs') WITH ORDINALITY
        LOOP
            -- Decode the address from base64
            address := decode(output_data->>'address', 'base64');

            -- Insert output data into tx_out table
            INSERT INTO tx_out (tx_id, index, address, value)
            VALUES (
                tx_id,
                output_index,
                address,
                (output_data->>'coin')::BIGINT
            );
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
