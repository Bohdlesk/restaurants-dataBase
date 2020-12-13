require('dotenv').config();
var express = require('express');
var morgan = require('morgan');
// const db = require('./elephantsql');
var pg = require('pg');

var conString = "postgres://fosjswqy:HTqEem25hI_cDS0WlluO2ElogAFvVySd@hattie.db.elephantsql.com:5432/fosjswqy";
var client = new pg.Client(conString);
const app = express();

app.use(express.json());

client.connect(function (err) {

    if (err) {
        return console.error('could not connect to postgres', err);
    }

    client.query('SELECT NOW() AS "theTime"', function (err, result) {
        if (err) {
            return console.error('error running query', err);
        }

        console.log(result.rows[0].theTime);
        // client.end();
    });
});


// get all restaurants
app.get('/api/v1/restaurants', (req, res) => {
    // const results = await db.query("select * from restaurants");

    client.query('SELECT * FROM "public"."restaurants"', function (err, result) {

        if (err) {
            return console.error('error running query', err);
        }

        if (result.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'restaurant list is empty'
            });
        } else {
            res.status(200).json({
                status: 'success',
                restaurants: result.rows
            });
        }
    })
    // } catch (err) {
    //     res.status(404).json({
    //         status: 'error'
    //     });
    //     console.log(err);
    // }
});

// create a restaurant
app.post('/api/v1/restaurants', (req, res) => {
    var checker = 0;
    client.query('SELECT * FROM "public"."restaurants"', function (err, result) {
        if (err) {
            return console.error('error running query', err);
        }
        // console.log('test point for 1')

        for (let i in result.rows) {
            if ((result.rows[i].name === req.body.name) && (result.rows[i].location === req.body.location)) {
                checker++;
                break;
            }
        }

        if (checker > 0) {
            console.log('test')
            res.status(404).json({
                status: 'error',
                message: 'restaurant with this name in this location is already created'
            })
        } else if (!((req.body.price_range > 0) && (req.body.price_range < 6))) {
            res.status(404).json({
                status: 'error',
                message: 'wrong price range value'
            })
        } else {
            // const query = {
            //     //         text: "insert into restaurants (name, location, price_range) values ($1, $2, $3);",
            //     //         values: [req.body.name, req.body.location, req.body.price_range],
            //     //     }
            client.query('INSERT INTO "public"."restaurants" (name, location, price_range) values ($1, $2, $3)', [
                req.body.name, req.body.location, req.body.price_range], function (err, result) {
                if (err) {
                    return console.error('error running query', err);
                }
                res.status(200).json({
                    status: 'success',
                    restaurants: req.body
                });
            })
        }
    })
});

// delete restaurant
app.delete('/api/v1/restaurants/:id', (req, res) => {

    let id = req.params.id;
    client.query('SELECT * FROM "public"."restaurants" where id = $1', [id], function (err, result) {

        if (err) {
            return console.error('error running query', err);
        }

        if (result.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'restaurant is not found'
            })
        } else {
            client.query('DELETE FROM "public"."restaurants" WHERE id = $1', [id], function (err, result) {
                if (err) {
                    return console.error('error running query', err);
                }
                res.status(204).json({
                    status: 'success'
                })
            });

        }
    });
});

// get a restaurant (ONE)
app.get('/api/v1/restaurants/:id', (req, res) => {

    let id = req.params.id;
    client.query('SELECT * FROM "public"."restaurants" where id = $1', [id], function (err, result) {
        if (err) {
            return console.error('error running query', err);
        }

        if (result.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'restaurant is not found'
            })
        } else {
            res.status(200).json({
                status: 'success',
                restaurant: result.rows
            });
        }
    });
});


// Uppdate restaurants
app.post('/api/v1/restaurants/:id', (req, res) => {

    let id = req.params.id;
    client.query('SELECT * FROM "public"."restaurants" where id = $1', [id], function (err, result) {

        if (err) {
            return console.error('error running query', err);
        }

        if (result.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'restaurant is not found'
            })
        } else {
            client.query('UPDATE "public"."restaurants" SET name = $1 where id = $2', [req.body.name,
                id], function (err, result) {
                if (err) {

                    return console.error('error running query', err);
                }
            })
            client.query('UPDATE "public"."restaurants" SET location = $1 where id = $2', [req.body.location,
                id], function (err, result) {

                if (err) {
                    return console.error('error running query', err);
                }

            })
            client.query('UPDATE "public"."restaurants" SET price_range = $1 where id = $2', [req.body.price_range,
                id], function (err, result) {

                if (err) {
                    return console.error('error running query', err);
                }

            })

            res.status(200).json({
                status: 'success'
                // restaurant: req.body

            });

        }
    })
});


//post restaurant review
app.post('/api/v1/restaurants/:id/reviews', (req, res) => {

    let id = req.params.id;
    client.query('SELECT * FROM "public"."restaurants" where id = $1', [id], function (err, result) {
        if (err) {
            return console.error('error running query', err);
        }

        if (result.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'restaurant is not found'
            })
        } else if (!((req.body.stars > 0) && (req.body.stars < 6))) {
            res.status(404).json({
                status: 'error',
                message: 'wrong stars value'
            })
        } else {
            client.query('INSERT INTO "public"."reviews" (rest_id, name, feedback_text, stars) values ($1, $2, $3, $4)',
                [id, req.body.name, req.body.feedback_text, req.body.stars], function (err, result) {
                    if (err) {
                        return console.error('error running query', err);
                    }
                    res.status(200).json({
                        status: 'success',
                        reviews: {
                            rest_id: id,
                            name: req.body.name,
                            feedback_text: req.body.feedback_text,
                            stars: req.body.stars,
                        }
                    })
                })
        }
    })
})
;

//get restaurant reviewS
app.get('/api/v1/restaurants/:id/rewiews', (req, res) => {

    let id = req.params.id;
    client.query('SELECT * FROM "public"."reviews" where rest_id = $1', [id], function (err, result) {
        if (err) {
            return console.error('error running query', err);
        }

        if (result.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'restaurant reviews is not found'
            })
        } else {
            var rating = 0;
            let i = 0;
            for (i in result.rows) {
                rating += result.rows[i].stars;
            }
            rating = rating / (++i);

            res.status(200).json({
                status: 'success',
                'restaurant id': req.params.id,
                'restaurant rating': rating,
                results: result.rows
            });
        }
    })
});


app.get('/api/v1', (req, res) => {
    console.log(404);
    res.status(404).json({
        status: '404',
    });
});

const port = 8000;
app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}...`);
});