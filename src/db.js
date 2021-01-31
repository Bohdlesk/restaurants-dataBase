const pg = require('pg');
const constants = require('./const')

const client = new pg.Client(constants.PGHOST);

async function connectToDatabase() {
    try {
        await client.connect();
        const currentTime = await getCurrentTimeFromDB();
        console.log('DB connected ', currentTime);
    } catch (error) {
        console.error('Error: ', error);
    }
}

async function getCurrentTimeFromDB() {
    try {
        const queryData = await client
            .query('SELECT NOW() AS "theTime"');
        return queryData.rows[0].theTime;
    } catch (error) {
        return error;
    }
}

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

module.exports = {connectToDatabase, getRestaurantsList, getRestaurantById}