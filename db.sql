
CREATE TABLE restaurants (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL ,
    location VARCHAR(50) NOT NULL,
    price_range INT NOT NULL check (price_range >=1 and price_range <=5)
);

CREATE TABLE reviews (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    rest_id BIGINT NOT NULL REFERENCES restaurants(id),
    name TEXT NOT NULL,
    feedback_text VARCHAR(100) NOT NULL,
    stars INT NOT NULL check (stars >=1 and stars <= 5)
);

-- INSERT INTO restaurants (name, location, price_range) values ('mac', 'new york', 3);