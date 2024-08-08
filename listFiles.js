const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.handler = async (event) => {
    const sourceBucketName = process.env.SOURCE_BUCKET;

    const objects = await s3
        .listObjectsV2({
            Bucket: sourceBucketName,
        })
        .promise();

    const files = objects.Contents.map((obj) => obj.Key);

    const batchSize = 100;
    const fileBatches = [];
    for (let i = 0; i < files.length; i += batchSize) {
        fileBatches.push(files.slice(i, i + batchSize));
    }

    return {
        statusCode: 200,
        batches: fileBatches,
        date: event.date,
    };
};
