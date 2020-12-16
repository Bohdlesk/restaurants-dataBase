// require('dotenv').config();
var express = require('express');
// var morgan = require('morgan');
// const db = require('./elephantsql');
var pg = require('pg');
const cors = require('cors');

const app = express();
const corsOptions = {
    origin : '*',
    optionsSuccessStatus:200
}



app.use(express.json());
app.use (cors(corsOptions));
// app.use(function(req, res, next) {
//     express.json();
//     cors(corsOptions);
//     next();
// });


var conString = "postgres://fosjswqy:HTqEem25hI_cDS0WlluO2ElogAFvVySd@hattie.db.elephantsql.com:5432/fosjswqy";
var client = new pg.Client(conString);

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "http://localhost:3000/");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     console.log('t');
//     next();
// });




// app.use(function(req, res, next){
//     res.header('Access-Control-Allow-Origin', "*");
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT');
//     res.header("Access-Control-Allow-Headers", "*");
//     res.header("Access-Control-Max-Age", "1728000");
//     console.log('t')
//     return res.sendStatus(200);
// });


client.connect(function (err) {

    if (err) {
        return console.error('could not connect to postgres', err);
    }

    client.query('SELECT NOW() AS "theTime"', function (err, result) {
        if (err) {
            return console.error('error running query', err);
        }

        console.log(result.rows[0].theTime);
    });
});


// app.get('/api/v1/restaurants', cors(corsOptions), (req, res, next) => {
//     console.log('work bit h!!!!!!!!1')
//     res.json({msg: 'This is CORS-enabled for a Single Route'})
// });

// get all restaurants
app.get('/api/v1/restaurants', (req, res) => {

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
            // result.rows.rating = {}
            // console.log(result.rows)
            //
            // let restaurantsId = [];
            // for (x in result.rows){
            //     restaurantsId.push(result.rows[x].id)
            // }
            // console.log(restaurantsId)
            //
            // client.query('SELECT id, rest_id, stars FROM "public"."reviews"', function (err, result1) {
            //     if (err) {
            //         return console.error('error running query', err);
            //     }
            //     console.log(result1.rows)
            //     for (x in result.rows){
            //
            //     }
            // })



            res.status(200).json({
                status: 'success',
                restaurants: result.rows
            });
        }
    })
});

// create a restaurant
app.post('/api/v1/restaurants', (req, res) => {
    console.log('hi world')
    var checker = 0;
    client.query('SELECT * FROM "public"."restaurants"', function (err, result) {
        if (err) {
            return console.error('error running query', err);
        }

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

            // console.log(req.body.website)
            // let test = req.body.websitel
            // if(test === {}){
            //     test = null
            // }

            client.query(
                'INSERT INTO "public"."restaurants" (name, location, price_range, website) values ($1, $2, $3, $4)',
                [req.body.name, req.body.location, req.body.price_range, req.body.website],
                function (err, result) {
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
            })
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
        } else if ((req.body.price_range > 5) || (req.body.price_range  < 1)){
            res.status(404).json({
                status: 'error',
                message: 'price_range out of range'
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
                    // res.status(404);
                    // console.log('test')
                    return console.error('error running query', err);

                }

            })
            client.query('UPDATE "public"."restaurants" SET website = $1 where id = $2', [req.body.website,
                id], function (err, result) {

                if (err) {
                    return console.error('error running query', err);

                }

            })

            res.status(200).json({
                status: 'success'
            });

        }
    })
});


//post restaurant review
app.post('/api/v1/restaurants/:id/reviews', (req, res) => {
    // console.log(req)
    let id = req.params.id;
    client.query('SELECT * FROM "public"."restaurants" where id = $1', [id], function (err, result) {
        if (err) {
            return console.error('error running query 1', err);
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
        }else {

            let oldReviewsQuantity = result.rows[0].reviews_quantity;
            let oldRestaurantRating = result.rows[0].rating;
            let newReviewsQuantity = oldReviewsQuantity + 1;

            if(oldReviewsQuantity === null){
                changeReviewsQuantity(1, id);
            } else{
                changeReviewsQuantity(newReviewsQuantity, id)
            }

            let newReviewRating = req.body.stars;

            let newRestaurantRating = (oldReviewsQuantity * oldRestaurantRating + newReviewRating)/
                (newReviewsQuantity);

            changeRestaurantRating(newRestaurantRating, id);










            // console.log(result.rows[0].rating)
            // let oldRating = result.rows[0].rating;
            // let newRating = req.body.stars;
            // console.log('old ' + oldRating)
            // console.log('плюсовать ' + newRating)
            // if (oldRating === null){
            //     oldRating = newRating;
            //     console.log('test' )
            // } else{
            //     oldRating += newRating;
            //     oldRating /= 2;
            //
            // }
            // console.log('new ' + oldRating)
            // console.log(rating)



            // UPDATE "public"."restaurants" SET website = $1 where id = $2
            // client.query(
            //     'UPDATE "public"."restaurants" SET rating = $1 where id = $2',
            //     [oldRating, id], function (err, result) {
            //         if (err) {
            //             return console.error('error running query 2', err);
            //         }
            //         // res.status(200).json({
            //         //     status: 'success',
            //         //     restaurants: req.body
            //         // });
            //     })



            client.query('INSERT INTO "public"."reviews" (rest_id, name, feedback_text, stars) values ($1, $2, $3, $4)',
                [id, req.body.name, req.body.feedback_text, req.body.stars], function (err, result) {
                    if (err) {
                        return console.error('error running query 3', err);
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
            client.query('SELECT rating FROM "public"."restaurants" where id = $1', [id],
                function (err, result1) {
                    if (err) {
                        return console.error('error running query', err);
                    }
                    let rating = result1.rows[0].rating;
                    res.status(200).json({
                        status: 'success',
                        rating,
                        restaurant_id: req.params.id,
                        results: result.rows
                    });
                })




        }
    })
});


app.get('/api/v1', (req, res) => {
    // console.log(404);
    res.status(404).json({
        status: '404',
    });
});


function changeReviewsQuantity(reviewsQuantity,id) {
    client.query('UPDATE "public"."restaurants" SET reviews_quantity = $1 where id = $2', [reviewsQuantity, id],
        function (err, result) {
            if (err) {
                return console.error('error running query', err);
            }
        })
}

function changeRestaurantRating(newRating,id) {
    client.query('UPDATE "public"."restaurants" SET rating = $1 where id = $2', [newRating, id],
        function (err, result) {
            if (err) {
                return console.error('error running query', err);
            }
        })
}

// function getRestaurantRating(id) {
//     let res = null;
//     client.query('SELECT rating FROM "public"."restaurants" where id = $1', [id],
//         function (err, result) {
//             if (err) {
//                 return console.error('error running query', err);
//             }
//             // console.log(result.rows[0].rating)
//             res = result.rows[0].rating;
//         })
//     return
// }
//
// console.log(getRestaurantRating(1));


const port = process.env.PORT || 80;
app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}...`);
});