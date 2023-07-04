const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3({
  region,
  accessKey,
  secretAccessKey,
});

//download a file from s3

function getFilesStream(req, res, next) {
  const fileKey = req.params.key;
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };
  s3.headObject(downloadParams)
    .promise()
    .then(() => {
      // This will not throw error anymore
      s3.getObject(downloadParams).createReadStream().pipe(res);
    })
    .catch((error) => {
      if (error.statusCode === 404) {
        // Catching NoSuchKey
        res.json({
          success: false,
          message: error.code,
        });
      }
    });
}
exports.getFilesStream = getFilesStream;
