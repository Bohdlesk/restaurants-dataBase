const express = require('express');

const router = express.Router();

router.post('/:id', async (req, res) => {
    try {

    } catch (error) {
        res.status(404).json({
            status: 'error',
        });
    }
});

module.exports = router;