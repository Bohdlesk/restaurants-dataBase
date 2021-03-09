import { Request, Response } from 'express';
import AWS from 'aws-sdk';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import { PathNaming } from 'aws-sdk/clients/mediastoredata';
import { awsConstants } from '../../constants';

export default async (req: Request, res: Response): Promise<void> => {
  try {
    AWS.config.update({
      ...awsConstants,
    });
    const s3Bucket = new AWS.S3();

    // Функция загрузки картинки
    const imageUpload = (path: PathNaming, buffer: string) => {
      const data: PutObjectRequest = {
        Bucket: 'restaurantsdatabaseimages',
        Key: path,
        Body: buffer,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg',
        ACL: 'public-read',
      };
      return new Promise((resolve, reject) => {
        s3Bucket.putObject(data, (err) => {
          if (err) {
            console.log('err inn promise');
            reject(new Error('err image upload'));
          } else {
            resolve(`https://s3.amazonaws.com/bucketname/imagename.jpg${path}`);
          }
        });
      });
    };

    res.status(200).json({
      status: 'success',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error,
    });
  }
};
