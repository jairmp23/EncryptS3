const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const crypto = require("crypto");

exports.handler = async (event) => {
  const currentDate = new Date().toISOString().split("T")[0];

  // Generar una clave de encriptación AES-256
  const encryptionKey = crypto.randomBytes(32).toString("base64");

  const keyInfo = {
    date: currentDate,
    encryption_key: encryptionKey,
  };

  const bucketName = process.env.KEY_BUCKET;
  const keyName = `keys/${currentDate}.json`;

  await s3
    .putObject({
      Bucket: bucketName,
      Key: keyName,
      Body: JSON.stringify(keyInfo),
    })
    .promise();

  return keyInfo;
};
