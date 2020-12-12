require('dotenv').config();
var express = require('express');
var morgan = require('morgan');
// const db = require('./elephantsql');
var pg = require('pg');

var conString = "postgres://fosjswqy:HTqEem25hI_cDS0WlluO2ElogAFvVySd@hattie.db.elephantsql.com:5432/fosjswqy"
var client = new pg.Client(conString);
const app = express();

app.use(express.json());

client.connect(function (err) {
    if (err) {
        return console.error('could not connect to postgres', err);
    }
    // SELECT * FROM "public"."restaurants";
    client.query('SELECT NOW() AS "theTime"', function (err, result) {
        if (err) {
            return console.error('error running query', err);
        }
        console.log(result.rows[0].theTime);
        // console.log('test 1');
        // >> output: 2018-08-23T14:02:57.117Z
        // client.end();
    });
});


// get all restaurants
app.get('/api/v1/restaurants', (req, res) => {
    // try {
    // const results = await db.query("select * from restaurants");
    // res.status(200).json({
    //     status: 'succes',
    //     results: results.rows.length,
    //     data: {
    //         restaurants: results.rows
    //     }
    // });
    // SELECT * FROM "public"."restaurants";
    // console.log('test point')
    // client.query('SELECT * FROM "public"."restaurants"', function (err, result) {
    //     if (err) {
    //         return console.error('error running query', err);
    //     }
    //     console.log(result);
    //     // >> output: 2018-08-23T14:02:57.117Z
    //     client.end();
    // });
    // console.log('test point');
    client.query('SELECT * FROM "public"."restaurants"', function (err, result) {
        if (err) {
            return console.error('error running query', err);
        }
        // console.log('test point1');
        // console.log(result);
        if (result.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'restaurant list is empty'
                // results: result.rows.length,

            });
        } else {
            res.status(200).json({
                status: 'success',
                // results: result.rows.length,
                restaurants: result.rows
            });
        }
    })

    //     const results = await db.query("SELECT * FROM \"public\".\"restaurants\";");
    //     res.status(200).json({
    //         status: 'succes',
    //         results: results.rows.length,
    //         data: {
    //             restaurants: results.rows
    //         }
    //     });
    // } catch (err) {
    //     res.status(404).json({
    //         status: 'error'
    //     });
    //     console.log(err);
    // }
// }
});

// create a restaurant
app.post('/api/v1/restaurants', (req, res) => {
    // try {
    var checker = 0;
    client.query('SELECT * FROM "public"."restaurants"', function (err, result) {
        if (err) {
            return console.error('error running query', err);
        }
        console.log('test point for 1')

        for (let i in result.rows) {
            if ((result.rows[i].name === req.body.name) && (result.rows[i].location === req.body.location)) {
                checker++;
                // console.log('test point for')
                // console.log(checker)
                break;
            }
        }
        // console.log('point')
        // console.log(checker)
        if (checker > 0) {
            console.log('test')
            res.status(404).json({
                status: 'error',
                message: 'restaurant with this name in this locatin is already created'
            })
        } else if(!((req.body.price_range > 0) && (req.body.price_range < 6))){
            res.status(404).json({
                status: 'error',
                message: 'wrong price range value'
            })
        }else {
            // const query = {
            //     //         text: "insert into restaurants (name, location, price_range) values ($1, $2, $3);",
            //     //         values: [req.body.name, req.body.location, req.body.price_range],
            //     //     }
            //insert into "public"."restaurants" (name, location, price_range) values ('rest', 'loc', 3);
            client.query('INSERT INTO "public"."restaurants" (name, location, price_range) values ($1, $2, $3)', [
                req.body.name, req.body.location, req.body.price_range], function (err, result) {
                if (err) {
                    return console.error('error running query', err);
                }
                res.status(200).json({
                    status: 'success',
                    // results: result.rows.length,
                    restaurants: req.body
                });
            })
        }
        // return checker;
        // client.end();
    })


    // } catch (err) {
    //     console.log(err)
    // }


    // try {
    // console.log(req.body)

    // const getRest = await db.query(
    //     "select * from restaurants where name = $1", [req.body.name]
    // );
    //
    // // console.log(getRest.rows[0])
    // for(let x in getRest.rows){
    // if ((getRest.rows[x].name === req.body.name) && (getRest.rows[x].location === req.body.location)) {
    //     res.status(404).json({
    //         status: 'error',
    //         message: 'rastaurant not found'
    //     })
    //     break
    // }}


    //     const query = {
    //         text: "insert into restaurants (name, location, price_range) values ($1, $2, $3);",
    //         values: [req.body.name, req.body.location, req.body.price_range],
    //     }
    //     const results = await db.query(query);
    //     res.status(201).json({
    //         status: 'succes',
    //         data: {
    //             restaurant: req.body
    //         }
    //     })
    // } catch (err) {
    //     res.status(404).json({
    //         status: 'error'
    //     });
    //     console.log(err);
    // }
// }
});

// delete restaurant
app.delete('/api/v1/restaurants/:id', (req, res) => {
    //DELETE FROM "public"."restaurants" WHERE id = '3'
    let id = req.params.id;
    client.query('SELECT * FROM "public"."restaurants" where id = $1', [id], function (err, result) {
        // console.log('t estw')
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

// const results = await db.query(
//  "select * from restaurants where id = $1", [req.params.id]
//  );
//     if (results.rows.length === 0) {
//         res.status(404).json({
//             status: 'error',
//             message: 'rastaurant not found'
//         })
//     } else {
//         var query = {
//             text: 'delete from restaurants where id = $1;',
//             values: [id]
//         }
//         // const results = await db.query(query);
//         res.status(204).json({
//             status: 'succes'
//         })
//     }
// } catch (err) {
//     res.status(404).json({
//         status: 'error'
//     });
//     console.log(err);
// }


// get a restaurant (ONE)
app.get('/api/v1/restaurants/:id', (req, res) => {
    //SELECT * FROM "public"."restaurants" WHERE id = 22

    let id = req.params.id;
    client.query('SELECT * FROM "public"."restaurants" where id = $1', [id], function (err, result) {
        // console.log('t estw')
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
        // console.log('t estw')
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

            // const results = await db.query(query.dataBaseRow);
            // const name = await db.query(query.changeDbRowName);
            // const location = await db.query(query.changeDbRowLocation);
            // const price_range = await db.query(query.changeDbRowPrice_range);

            res.status(200).json({
                status: 'success',
                restaurant: req.body
            });
        }
    })
});


//post restaurant review
// need add errors checker
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
        } else if (!((req.body.stars > 0) && (req.body.stars < 6))){
            res.status(404).json({
                status: 'error',
                message: 'wrong stars value'
            })
        }else {
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
            // console.log(result.rows)
            for (i in result.rows) {
                rating += result.rows[i].stars;
                // console.log(rating)
            }
            rating = rating / (++i);
            res.status(200).json({
                status: 'success',
                'restaurant id': req.params.id,
                'restaurnt rating': rating,
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