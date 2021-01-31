const {client} = require("./db");

async function getRestaurantsList(paramOfSort, typeOfSort) {
    try {
        const result = await client
            .query(`SELECT * FROM restaurants ORDER BY ${paramOfSort} ${typeOfSort} NULLS LAST`);
        return result.rows;
    } catch (error) {
        return error;
    }
}

function getRestaurantById(restaurantId) {
    return client
        .query('SELECT * FROM "public"."restaurants" where id = $1', [restaurantId]);
}

function deleteRestaurant(restaurantId) {
    return client
        .query('DELETE FROM restaurants WHERE id = $1', [restaurantId])
}