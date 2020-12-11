require('dotenv').config();
var express = require('express');
//var morgan = require('morgan');
const db = require('./db');

const app = express();

app.use(express.json());

// get all restaurants
app.get('/api/v1/restaurants', async (req, res) => {
    try {
        const results = await db.query("select * from restaurants");
        res.status(200).json({
            status: 'succes',
            results: results.rows.length,
            data: {
                restaurants: results.rows
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'error'
        });
        console.log(err);
    }
});

// get a restaurant (ONE)
app.get('/api/v1/restaurants/:id', async (req, res) => {
    try {
        const results = await db.query(
            "select * from restaurants where id = $1", [req.params.id]
        );
        res.status(200).json({
            status: 'succes',
            data: {
                restaurant: results.rows[0]
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'error'
        });
        console.log(err)
    }
});

// create a restaurant
app.post('/api/v1/restaurants', async (req, res) => {
    try {
        let query = {
            text: "insert into restaurants (name, location, price_range) values ($1, $2, $3);",
            values: [req.body.name, req.body.location, req.body.price_range]
        }
            // const results = await db.query(query);
        res.status(201).json({
            status: 'succes',
            data: {
                restaurant: req.body
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'error'
        });
        console.log(err);
    }
});

// Uppdate restaurants
app.post('/api/v1/restaurants/:id', async (req, res) => {
    var id = req.params.id;
    try {
        const query = {
            dataBaseRow: {
                text: "select * from restaurants where id = $1;",
                values: [id]
            },
            changeDbRowName: {
                text: "UPDATE restaurants SET name = $1 WHERE id = $2;",
                values: [req.body.name, id]
            },
            changeDbRowLocation: {
                text: "UPDATE restaurants SET location = $1 WHERE id = $2;",
                values: [req.body.location, id]
            },
            changeDbRowPrice_range: {
                text: "UPDATE restaurants SET price_range = $1 WHERE id = $2;",
                values: [req.body.price_range, id]
            }
        }
        // const results = await db.query(query.dataBaseRow);
        // const name = await db.query(query.changeDbRowName);
        // const location = await db.query(query.changeDbRowLocation);
        // const price_range = await db.query(query.changeDbRowPrice_range);

        res.status(200).json({
            status: 'succes',
            data: {
                restaurant: req.body
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'error'
        });
        console.log(err);
    }
});

// delete restaurant
app.delete('/api/v1/restaurants/:id', async (req, res) => {
    try {
        var id = req.params.id;
        var query = {
            text: 'delete from restaurants where id = $1;',
            values: [id]
        }
        // const results = await db.query(query);
        res.status(204).json({
            status: 'succes'
        })
    } catch (err) {
        res.status(404).json({
            status: 'error'
        });
        console.log(err);
    }
});

//post restaurant review
// need add errors
app.post('/api/v1/restaurants/:id/reviews', async (req, res) => {
    try {
        var id = req.params.id;
        var query = {
            text: 'INSERT INTO reviews (rest_id, name, feedback_text, stars) values ($1, $2, $3, $4);',
            values: [id, req.body.name, req.body.feedback_text, req.body.stars]
        }
        // const results = await db.query(query);
        res.status(200).json({
            status: 'succes',
            data: {
                reviews: {
                    rest_id: id,
                    name: req.body.name,
                    feedback_text: req.body.feedback_text,
                    stars: req.body.stars
                }
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'error'
        });
        console.log(err);
    }
});

//get restaurant reviewS
app.get('/api/v1/restaurants/:id/rewiews', async (req, res) => {
    try {
        var id = req.params.id;
        var query = {
            text: 'select id, name, feedback_text,stars from reviews where rest_id = $1',
            values: [id]
        }
        var results = await db.query(query);
        if (results.rows.length === 0) {
            res.status(404).json({
                status: 'error'
            })
        } else {
            var rating = 0;
            for (i in results.rows) {
                rating += results.rows[i].stars;
            }
            rating = rating / (++i);
            res.status(200).json({
                status: 'succes',
                'restaurant id': req.params.id,
                rating: rating,
                results: results.rows
            });
        }
    } catch (err) {
        res.status(404).json({
            status: 'error'
        });
        console.log(err);
    }
});
app.get('/api/v1', (req, res) => {
    console.log(404);
    res.status(404).json({
        status: '404',
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}...`);
});