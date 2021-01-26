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
    try {
        let typeOfSort = req.query.order;
        let paramOfSort = req.query.name || 'id';

        if (typeOfSort === '[]asc') typeOfSort = 'ASC'
        else typeOfSort = 'DESC'

        const result = await client
            .query(`SELECT * FROM restaurants ORDER BY ${paramOfSort} ${typeOfSort} NULLS LAST`)
        res.status(200).json({
            status: 'success',
            restaurants: result.rows,
        });
    } catch (e) {
        res.status(404).json({
            status: 'error running query',
        });
    }
});

//upload picture on server
app.post('/api/v1/restaurants/picture', upload.single('upload'), async (req, res) => {
        try {
            const buffer = req.file.buffer;
            const restId = req.body.id;
            const imagePath = 'restaurantMainImage/' + restId + '.jpg';
            // req.file.originalname;
            await imageUpload(imagePath, buffer);
        } catch (e) {
            res.status(404).send({
                status: 'error'
            })
        }
    }, (error, req, res, next) => {
        res.status(404).send({
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
                error: 'wrong price range value'
            })
        }

        let restaurantsList = result.rows;
        for (let i in restaurantsList) {
            if ((restaurantsList[i].name === req.body.name)
                && (restaurantsList[i].location === req.body.location)) {
                return res.status(404).json({
                    error: 'restaurant with this name / in this location is already created'
                })
            }
        }

        result = await client
            .query('INSERT INTO "public"."restaurants" (name, location, price_range, website)' +
                ' values ($1, $2, $3, $4) returning *',
                [req.body.name, req.body.location, req.body.price_range, req.body.website]);

        // const restId = result.rows[0].id;
        // const imagePath = 'restaurantMainImage/' + restId + '.jpg';
        // const buffer = req.file.buffer;
        // const imageLink = AWS_LINK_FOR_SERVER + imagePath;

        // await client.query('UPDATE "public"."restaurants" SET image_link = $1 ' +
        //     'where id = $2', [imageLink, restId]);

        // await imageUpload(imagePath, buffer);
        return res.status(200).json({
            status: 'success',
            restaurant: result.rows[0]
        });
    } catch (e) {
        res.status(404).send({
            status: 'error'
        })
    }
}, (error, req, res, next) => {
    res.status(404).send({error: error.message})
});

// delete restaurant
app.delete('/api/v1/restaurants/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let result = await client
            .query('SELECT * FROM "public"."restaurants" where id = $1', [id])

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'restaurant is not found'
            })
        }

        await client
            .query('DELETE FROM "public"."reviews" WHERE rest_id = $1', [id]);
        await client
            .query('DELETE FROM "public"."restaurants" WHERE id = $1', [id]);

        res.status(204).json({
            status: 'success'
        });
    } catch (e) {
        res.status(404).send({
            status: 'error'
        })
    }
});

// get a restaurant (ONE)
app.get('/api/v1/restaurants/:id', async (req, res) => {

    try {
        const id = req.params.id;
        let result = await selectRestaurant(id)
        res.status(200).json({
            status: 'success',
            restaurant: result.rows[0]
        });
    } catch (e) {
        res.status(404).send({
            status: 'error'
        })
    }
});

// Uppdate restaurants
app.post('/api/v1/restaurants/:id', async (req, res) => {

    try {
        const id = req.params.id;

        await selectRestaurant(id);

        if (!(req.body.name === null)) {
            await client
                .query('UPDATE "public"."restaurants" SET name = $1 where id = $2', [req.body.name,
                    id]);
        }
        if (!(req.body.location === null)) {
            await client
                .query('UPDATE "public"."restaurants" SET location = $1 where id = $2', [req.body.location,
                    id]);
        }

        if (!(req.body.price_range === null)) {
            await client
                .query('UPDATE "public"."restaurants" SET price_range = $1 where id = $2', [req.body.price_range,
                    id]);
        }
        if (!(req.body.website === null)) {
            await client
                .query('UPDATE "public"."restaurants" SET website = $1 where id = $2', [req.body.website,
                    id]);
        }
        res.status(200).json({
            status: 'success',
        });
    } catch (e) {
        res.status(404).send({
            status: 'error'
        })
    }
});

app.get('/send/massage/', async (req, res) => {
    return res.status(200).json({
        status: 'error',
        massage: 'Случилась ошибка, попробуйте воспользоваться Wi-fi подклчением к сети'
    });
})

//post restaurant review
app.post('/api/v1/restaurants/:id/reviews', async (req, res) => {

    try {
        let restaurantId = req.params.id;

        if (!((req.body.stars > 0) && (req.body.stars < 6))) {
            return res.status(404).send({
                status: 'error'
            })
        }

        let result = await selectRestaurant(restaurantId);
        await client
            .query('INSERT INTO "public"."reviews" (rest_id, name, feedback_text, stars) values ($1, $2, $3, $4)',
                [restaurantId, req.body.name, req.body.feedback_text, req.body.stars]);

        let oldReviewsQuantity = result.rows[0].reviews_quantity;
        let oldRestaurantRating = result.rows[0].rating;
        let newReviewsQuantity = oldReviewsQuantity + 1;

        await changeReviewsQuantity(newReviewsQuantity, restaurantId)
        let newReviewRating = req.body.stars;

        let newRestaurantRating = (oldReviewsQuantity * oldRestaurantRating + newReviewRating) /
            newReviewsQuantity;

        await changeRestaurantRating(newRestaurantRating, restaurantId);

        return res.status(200).json({
            status: 'success',
        });
    } catch (e) {
        res.status(404).send({
            status: 'error'
        })
    }
});

//get restaurant reviewS
app.get('/api/v1/restaurants/:id/reviews', async (req, res) => {
    try {
        let restaurantId = req.params.id;
        let result = await client
            .query('SELECT * FROM reviews WHERE rest_id = $1', [restaurantId])
        return res.status(200).json({
            status: 'success',
            reviews: result.rows
        });
    } catch (e) {
        res.status(404).send({status: 'error'})
    }
});

app.get('/api/v1', async (req, res) => {
    const rating = await getRestaurantRating(3202);
    console.log(rating);
    // console.log(req.query.order)
    res.status(200).json({
        rating,
        status: 'test',
    });
});

async function getRestaurantRating(id) {
    const result = await selectRestaurant(id)
    return result.rows[0].rating;
}

function selectRestaurant(id) {
    return client
        .query('SELECT * FROM "public"."restaurants" where id = $1', [id]);
}

function changeReviewsQuantity(reviewsQuantity, id) {
    return client
        .query('UPDATE "public"."restaurants" SET reviews_quantity = $1 where id = $2', [reviewsQuantity, id])
}

function changeRestaurantRating(newRating, id) {
    return client
        .query('UPDATE "public"."restaurants" SET rating = $1 where id = $2', [newRating, id])
}


const port = process.env.PORT || 80;
app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}...`);
});