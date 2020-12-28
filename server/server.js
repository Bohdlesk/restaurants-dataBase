require('dotenv').config();
const express = require('express');
// var morgan = require('morgan');
// const db = require('./elephantsql');
const pg = require('pg');
const cors = require('cors');
const AWS = require('aws-sdk');
const getImgBuffer = require('./getImgBuffer');
const image2base64 = require('image-to-base64');
const multer = require('multer');


const {AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, PGHOST, AWS_LINK_FOR_SERVER} = process.env;

AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: 'eu-central-1'
})

let imageBuffer;
const imageToBase64 = (path) => {
    image2base64(path)
        .then(
            (result) => {
                imageBuffer = getImgBuffer(result);
                return imageBuffer;
            }
        )
        .catch(
            (error) => {
                console.log(error);
            }
        )
};

const s3Bucket = new AWS.S3({params: {Bucket: 'restaurantsdatabaseimages'}});

//db setup
const conString = PGHOST;
const client = new pg.Client(conString);

//cors setup
const app = express();
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}
app.use(express.json());
app.use(cors(corsOptions));
// app.use(function(req, res, next) {
//     express.json();
//     cors(corsOptions);
//     next();
// });


const imageUpload = (path, buffer) => {
    const data = {
        Key: path,
        Body: buffer,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg',
        ACL: 'public-read'
    };
    return new Promise((resolve, reject) => {
        s3Bucket.putObject(data, (err) => {
            if (err) {
                console.log('err inn promise')
                reject(new Error('err image upload'));
            } else {
                resolve('https://s3.amazonaws.com/bucketname/imagename.jpg' + path);
            }
        });
    });
};

const getImageUrl = async (type, base64Image) => {
    const buffer = getImgBuffer(base64Image);
    const currentTime = new Date().getTime();
    return imageUpload(`${type}/${currentTime}.jpeg`, buffer);
};

//connect to db
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


const storage = multer.memoryStorage()
let upload = multer(
    {
        storage: storage,
        limits: {
            fileSize: 2000000, //2mb
        },
        fileFilter(req, file, callback) {
            if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
                callback(new Error('Please upload an image.'))
            }
            callback(undefined, true)
        }
    }
)


// get all restaurants
app.get('/api/v1/restaurants', async (req, res) => {
    // client.query('SELECT * FROM "public"."restaurants"', function (err, result) {
    //         if (err) {
    //             res.status(404).json({
    //                 status: 'error',
    //             });
    //             return console.error('error running query', err);
    //         } else {
    //             res.status(200).json({
    //                 status: 'seccess',
    //                 restaurants: result.rows,
    //             })
    //         }
    //     }
    // );
    try {
        const result = await client
            .query('SELECT * FROM "public"."restaurants"');
        res.status(200).json({
            status: 'success',
            restaurants: result.rows,
        });
    } catch (e) {
        res.status(404).json({
            status: 'error running query',
        });
    }


    // let typeOfSort = req.query.order
    // let paramOfSort = req.query.name
    // if (typeOfSort === '[]asc') {
    //     typeOfSort = 'ASC'
    // } else if (typeOfSort === '[]desc') {
    //     typeOfSort = 'DESC'
    // }
    // qve = 'SELECT * FROM "public"."restaurants" ORDER BY $1~ NULLs FIRST '
    // console.log(typeof (paramOfSort))
    // client.query('SELECT * FROM "public"."restaurants" ORDER BY $1 ',[paramOfSort],  function (err, result) {
    //         if (err) {
    //             res.status(404).json({
    //                 status: 'error',
    //             });
    //             return console.error('error running query', err);
    //         } else {
    //             res.status(200).json({
    //                 status: 'seccess',
    //                 restaurants: result.rows
    //             })
    //         }
    //     }
    // );


    // if (typeOfSort === 'ASC' || 'DESC') {

    // client.query('SELECT * FROM restaurants ORDER BY rating ASC NULLS FIRST', [paramOfSort],
    //       function (err, result)  {
    //             if (err) {
    //                 res.status(404).json({
    //                     status: 'error',
    //                 });
    //                 return console.error('error running query', err);
    //             }
    //             if (result.rows.length === 0) {
    //                 res.status(404).json({
    //                     status: 'error',
    //                     message: 'restaurant list is empty'
    //                 });
    //             } else {
    //                 res.status(200).json({
    //                     status: 'seccess',
    //                     restaurants: result.rows
    //                 })
    //                 // sortResult(result.rows, typeOfSort, parametrOfSort));
    //             }
    //
    //         })
});

////////////////////////////////////
function sortResult(result, typeOfSort, parametrOfSort) {

    if (parametrOfSort === 'rating') sortByRating(result, typeOfSort);
    if (parametrOfSort === 'reviews quantity') sortByReviewsQuant(result, typeOfSort);

    return ({
        status: 'success',
        restaurants: result
    })
}

function sortByReviewsQuant(array, typeOfSort) {
    const forIncreasing = '[]asc'
    const forDecreasing = '[]desc'
    let arrayForSorting = [];
    for (let i = 0; i < array.length; i++) {
        arrayForSorting[i] = array[i].reviews_quantity;
    }
    // console.log(arrayForSorting)
    if (typeOfSort === forIncreasing) sortByIncreasing(arrayForSorting)
    if (typeOfSort === forDecreasing) sortByDecreasing(arrayForSorting)
    for (let i = 0; i < array.length; i++) {
        array[i].reviews_quantity = arrayForSorting[i];
    }
    return array;
}

function sortByRating(array, typeOfSort) {
    const forIncreasing = '[]asc'
    const forDecreasing = '[]desc'
    let arrayForSorting = [];
    for (let i = 0; i < array.length; i++) {
        arrayForSorting[i] = array[i].rating;
    }
    // console.log(arrayForSorting)
    if (typeOfSort === forIncreasing) sortByIncreasing(arrayForSorting)
    if (typeOfSort === forDecreasing) sortByDecreasing(arrayForSorting)
    for (let i = 0; i < array.length; i++) {
        array[i].rating = arrayForSorting[i];
    }
    return array;
}

function sortByIncreasing(array) {
    console.log(array)

    array.sort((a, b) => {
        if (a < b) {
            return 1
        } else return -1
    })
    return array
}

function sortByDecreasing(array) {
    array.sort((a, b) => {
        if (a > b) {
            return 1
        } else return -1
    })
    return array
}

///////////////////////////////////////////

//upload picture on server
app.post('/api/v1/restaurants/picture', upload.single('upload'), async (req, res) => {
        try {
            const buffer = req.file.buffer;
            const restId = req.body.id;
            const imagePath = 'restaurantMainImage/' + restId + '.jpg';
            // req.file.originalname;
            await imageUpload(imagePath, buffer);
        } catch (e) {
            res.status(400).send({
                status: 'error'
            })
        }
    }, (error, req, res, next) => {
        res.status(400).send({
            error: error.message
        })
    }
);

// create a restaurant
app.post('/api/v1/restaurants', upload.single('upload'), async (req, res) => {

    try {
        let result = await client
            .query('SELECT * FROM "public"."restaurants"');

        if (!((req.body.price_range > 0) && (req.body.price_range < 6))) {
            return res.status(404).json({
                erorr: 'wrong price range value'
            })
        }

        let restaurantsList = result.rows;
        for (let i in restaurantsList) {
            if ((restaurantsList[i].name === req.body.name)
                && (restaurantsList[i].location === req.body.location)) {
                return res.status(404).json({
                    error: 'restaurant with this name in this location is already created'
                })
            }
        }

        result = await client
            .query('INSERT INTO "public"."restaurants" (name, location, price_range, website)' +
                ' values ($1, $2, $3, $4) RETURNING id',
                [req.body.name, req.body.location, req.body.price_range, req.body.website]);

        const restId = result.rows[0].id;
        const imagePath = 'restaurantMainImage/' + restId + '.jpg';
        const buffer = req.file.buffer;
        const imageLink = AWS_LINK_FOR_SERVER + imagePath;

        await client.query('UPDATE "public"."restaurants" SET image_link = $1 ' +
            'where id = $2', [imageLink, restId]);

        await imageUpload(imagePath, buffer);
        return res.status(200).json({
            status: 'success',
        });
    } catch (e) {
        res.status(400).send({status: 'error'})
    }
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
});


////////
// client
//     .query('SELECT * FROM "public"."restaurants"', function (err, result) {
//         if (err) {
//             res.status(404).json({
//                 status: 'error',
//             });
//             return console.error('error running query', err);
//         }
//
//         for (let i in result.rows) {
//             if ((result.rows[i].name === req.body.name) && (result.rows[i].location === req.body.location)) {
//                 checker++;
//                 break;
//             }
//         }
//
//
//         if (checker > 0) {
//             console.log('test')
//             res.status(404).json({
//                 message: 'restaurant with this name in this location is already created'
//             })
//         } else if (!((req.body.price_range > 0) && (req.body.price_range < 6))) {
//             res.status(404).json({
//                 message: 'wrong price range value'
//             })
//         } else {
//             client
//                 .query('INSERT INTO "public"."restaurants" (name, location, price_range, website)' +
//                     ' values ($1, $2, $3, $4) RETURNING id',
//                     [req.body.name, req.body.location, req.body.price_range, req.body.website],
//                     async function (err, result) {
//                         if (err) {
//                             return console.error('error running query', err);
//                         }
//
//                         const restId = result.rows[0].id
//                         const imagePath = 'restaurantMainImage/' + restId + '.jpg'
//                         const buffer = req.file.buffer;
//                         const imageLink = 'https://d1ua7nher2b0zf.cloudfront.net/' + imagePath;
//                         await client.query('UPDATE "public"."restaurants" SET image_link = $1 ' +
//                             'where id = $2', [imageLink, restId], async (err) => {
//                             if (err) {
//                                 res.status(404).json({
//                                     status: 'error running query',
//                                 });
//                             }
//                             await imageUpload(imagePath, buffer)
//                             res.status(200).json({
//                                 status: 'success',
//                             });
//                         })
//                     })
//         }
//     })
// } catch
// (e)
// {
//     res.status(400).send(e)
// }
// },
// (error, req, res, next) => {
//     res.status(400).send({error: error.message})
// }
// });

app.get('/api/v1/restaurants/image', async (req, res) => {
    const result = await client
        .query('SELECT * FROM "public"."restaurants"');

    console.log(result)
})

// delete restaurant
app.delete('/api/v1/restaurants/:id', (req, res) => {

    let id = req.params.id;

    client.query('SELECT * FROM "public"."restaurants" where id = $1', [id], function (err, result) {

        if (err) {
            res.status(404).json({
                status: 'error',
            });
            return console.error('error running query', err);
        }

        if (result.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'restaurant is not found'
            })
        } else {
            client.query('DELETE FROM "public"."reviews" WHERE rest_id = $1', [id], function (err, result) {
                if (err) {
                    res.status(404).json({
                        status: 'error',
                    });
                    return console.error('error running query', err);
                }
                client.query('DELETE FROM "public"."restaurants" WHERE id = $1', [id], function (err, result) {
                    if (err) {
                        res.status(404).json({
                            status: 'error',
                        });
                        return console.error('error running query', err);
                    }
                    res.status(204).json({
                        status: 'success'
                    });
                });
            });
        }
    });
});

// get a restaurant (ONE)
app.get('/api/v1/restaurants/:id', async (req, res) => {

    let id = req.params.id;

    client.query('SELECT * FROM "public"."restaurants" where id = $1', [id], function (err, result) {
        if (err) {
            res.status(404).json({
                status: 'error',
            });
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
                restaurant: result.rows[0]
            });
        }
    });
});
//
// async   function getRestaurantRating(id) {
//         const result =  await Promise(
//             client
//             .query('SELECT rating FROM "public"."restaurants" where id = $1', [id]);
//         // console.log('1 f ')
//         resolve(result);
//     )
// // .then( data => {
//         // return new Promise((resolve => {
//         //     // console.log('2 f ', data.rows[0].rating)
//         //     const rating = data.rows[0].rating
//         //     resolve(rating)
//         // }))
//         // console.log('2 f ', data.rows[0].rating)
//         // return data.rows[0].rating;
//     })
//     return (promise);
//     // return promise;
//     // try {
//     // let rating;
//     // const result = await client
//     //     .query('SELECT rating FROM "public"."restaurants" where id = $1', [id]);
//     // console.log('result1',result.rows[0].rating)
//     // return result.rows[0].rating;
//     // } catch (e) {
//     //     console.log(e)
//     // }
// }
// console.log(getRestaurantRating(1))

// async function zapros(id) {
//     let resul = 0;
//     const que = client.query('SELECT rating FROM "public"."restaurants" where id = $1', [id], function (err, result) {
//         // console.log(result.rows[0].rating)
//         console.log('her 2')
//         resul = result.rows[0].rating;
//         console.log('res in func', result.rows[0].rating)
//         // console.log('test');
//     });
//     console.log('result ', resul)
//     console.log('12f')
//     return que;
// }


// Uppdate restaurants
app.post('/api/v1/restaurants/:id', (req, res) => {

    let id = req.params.id;
    client.query('SELECT * FROM "public"."restaurants" where id = $1', [id], function (err, result) {

        if (err) {
            res.status(404).json({
                status: 'error',
            });
            return console.error('error running query', err);
        }

        if (result.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'restaurant is not found'
            })
        } else if ((req.body.price_range > 5) || (req.body.price_range < 1)) {
            res.status(404).json({
                status: 'error',
                message: 'price_range out of range'
            })
        } else {
            if (!(req.body.name === null)) {
                client.query('UPDATE "public"."restaurants" SET name = $1 where id = $2', [req.body.name,
                    id], function (err) {
                    if (err) {
                        res.status(404).json({
                            status: 'error',
                        });
                        return console.error('error running query', err);
                    }

                })
            }
            if (!(req.body.location === null)) {
                client.query('UPDATE "public"."restaurants" SET location = $1 where id = $2', [req.body.location,
                    id], function (err) {

                    if (err) {
                        res.status(404).json({
                            status: 'error',
                        });
                        return console.error('error running query', err);
                    }

                })
            }

            if (!(req.body.price_range === null)) {
                client.query('UPDATE "public"."restaurants" SET price_range = $1 where id = $2', [req.body.price_range,
                    id], function (err, result) {

                    if (err) {
                        res.status(404).json({
                            status: 'error',
                        });
                        return console.error('error running query', err);
                    }
                });
            }
            if (!(req.body.website === null)) {
                client.query('UPDATE "public"."restaurants" SET website = $1 where id = $2', [req.body.website,
                    id], function (err, result) {

                    if (err) {
                        res.status(404).json({
                            status: 'error',
                        });
                        return console.error('error running query', err);
                    }
                });
            }
            res.status(200).json({
                status: 'success'
            });
        }
    });
});


//post restaurant review
app.post('/api/v1/restaurants/:id/reviews', (req, res) => {

    let id = req.params.id;
    client.query('SELECT * FROM "public"."restaurants" where id = $1', [id], function (err, result) {
        if (err) {
            res.status(404).json({
                status: 'error',
            });
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
        } else {

            let oldReviewsQuantity = result.rows[0].reviews_quantity;
            let oldRestaurantRating = result.rows[0].rating;
            let newReviewsQuantity = oldReviewsQuantity + 1;

            changeReviewsQuantity(newReviewsQuantity, id)

            let newReviewRating = req.body.stars;

            let newRestaurantRating = (oldReviewsQuantity * oldRestaurantRating + newReviewRating) /
                newReviewsQuantity;

            changeRestaurantRating(newRestaurantRating, id);

            client.query('INSERT INTO "public"."reviews" (rest_id, name, feedback_text, stars) values ($1, $2, $3, $4)',
                [id, req.body.name, req.body.feedback_text, req.body.stars], function (err) {
                    if (err) {
                        res.status(404).json({
                            status: 'error',
                        });
                        return console.error('error running query 3', err);
                    }
                    res.status(200).json({
                        status: 'success',
                    })
                })
        }
    })
})
;

//get restaurant reviewS
app.get('/api/v1/restaurants/:id/reviews', (req, res) => {

    let id = req.params.id;
    client.query('SELECT * FROM "public"."reviews" where rest_id = $1', [id], function (err, result) {
        if (err) {
            res.status(404).json({
                status: 'error running query',
            });
            return console.error('error running query', err);
        }

        if (result.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'restaurant reviews is not found'
            })
            // } else {
            //     client.query('SELECT rating FROM "public"."restaurants" where id = $1', [id],
            //         function (err, result1) {
            //             if (err) {
            //                 return console.error('error running query', err);
            //             }
            // let rating = result1.rows[0].rating;
            // res.status(200).json({
            //     status: 'success',
            // rating: rating,
            // restaurant_id: req.params.id,
            // reviews: result.rows
            // });
            // })
        } else {
            res.status(200).json({
                status: 'success',
                reviews: result.rows
            });
        }
    })
});


app.get('/api/v1', (req, res) => {
    console.log(req.query.order)
    res.status(200).json({
        status: '404',
    });
});


function changeReviewsQuantity(reviewsQuantity, id) {
    client.query('UPDATE "public"."restaurants" SET reviews_quantity = $1 where id = $2', [reviewsQuantity, id],
        function (err, result) {
            if (err) {
                return console.error('error running query', err);
            }
        })
}

function changeRestaurantRating(newRating, id) {
    client.query('UPDATE "public"."restaurants" SET rating = $1 where id = $2', [newRating, id],
        function (err, result) {
            if (err) {
                return console.error('error running query', err);
            }
        })
}


//


const port = process.env.PORT || 80;
app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}...`);
});