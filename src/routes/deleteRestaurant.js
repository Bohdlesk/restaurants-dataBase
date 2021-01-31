const express = require('express');
const {deleteRestaurant} = require("../dataBase/restaurantsQueryes");

const router = express.Router();

router.delete('/:id', async (req, res) => {
    try {
        const restaurantId = req.params.id;
        // await client
            // .query('DELETE FROM "public"."reviews" WHERE rest_id = $1', [restaurantId]);
        await deleteRestaurant(restaurantId);
        res.status(204).json({
            status: 'success'
        });
    } catch (error) {
        res.status(404).json({
            status: 'error',
        });
    }
});

module.exports = router;