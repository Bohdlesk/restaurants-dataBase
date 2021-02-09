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

async function createRestaurant(request) {
    return await client
        .query('INSERT INTO "public"."restaurants" (name, location, price_range, website)' +
            ' values ($1, $2, $3, $4) returning *',
            [request.body.name, request.body.location, request.body.price_range, request.body.website])
}

function getRestaurantById(restaurantId) {
    return client
        .query('SELECT * FROM "public"."restaurants" where id = $1', [restaurantId]);
}

function deleteRestaurant(restaurantId) {
    return client
        .query('DELETE FROM restaurants WHERE id = $1', [restaurantId])
}

async function searchRestaurantByNameAndLocation(restaurantData){
    const isFound = await client
        .query('SELECT * FROM restaurants WHERE location = $1 AND name = $2',
            [restaurantData.location, restaurantData.name])
    return isFound
}


module.exports = {getRestaurantsList, getRestaurantById, deleteRestaurant, createRestaurant,
    searchRestaurantByNameAndLocation}