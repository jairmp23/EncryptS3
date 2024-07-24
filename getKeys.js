const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const bucketName = process.env.KEY_BUCKET;

  const currentDate = new Date().toISOString().split('T')[0];
  const keyName = `keys/${currentDate}.json`;

  try {
    const keyObject = await s3.getObject({
      Bucket: bucketName,
      Key: keyName
    }).promise();

    const keyInfo = JSON.parse(keyObject.Body.toString());

    return {
      statusCode: 200,
      body: JSON.stringify(keyInfo)
    };
  } catch (error) {
    console.error('Error getting the key:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error getting the key' })
    };
  }
};
