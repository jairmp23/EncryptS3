const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const crypto = require("crypto");

const decryptData = (data, key) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key, "base64"),
    Buffer.alloc(16, 0)
  );
  let decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted;
};

const encryptData = (data, key) => {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(key, "base64"),
    Buffer.alloc(16, 0)
  );
  let encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return encrypted;
};

const loadKey = async (date, bucketName) => {
  try {
    const keyObject = await s3
      .getObject({
        Bucket: bucketName,
        Key: `keys/${date}.json`,
      })
      .promise();
    const keyInfo = JSON.parse(keyObject.Body.toString());
    return keyInfo.encryption_key;
  } catch (error) {
    if (error.code === "NoSuchKey") {
      return null;
    }
    throw error;
  }
};

exports.handler = async (event) => {
  const bucketName = process.env.KEY_BUCKET;
  const sourceBucketName = process.env.SOURCE_BUCKET;
  const currentDate = event.date;

  const previousDate = new Date(
    new Date(currentDate).setDate(new Date(currentDate).getDate() - 1)
  )
    .toISOString()
    .split("T")[0];
  const previousKey = await loadKey(previousDate, bucketName);
  const currentKey = await loadKey(currentDate, bucketName);

  for (const fileKey of event.batch) {
    const fileObject = await s3
      .getObject({
        Bucket: sourceBucketName,
        Key: fileKey,
      })
      .promise();

    let decryptedData;
    if (previousKey) {
      decryptedData = decryptData(fileObject.Body, previousKey);
    } else {
      decryptedData = fileObject.Body;
    }

    const reencryptedData = encryptData(decryptedData, currentKey);

    await s3
      .putObject({
        Bucket: sourceBucketName,
        Key: fileKey,
        Body: reencryptedData,
      })
      .promise();
  }

  return {
    statusCode: 200,
    body: JSON.stringify("Files processed with new encryption key."),
  };
};
