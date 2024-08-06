const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const kms = new AWS.KMS();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const crypto = require("crypto");

const decryptData = (data, key) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key,
    Buffer.alloc(16, 0)
  );
  let decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted;
};

const encryptData = (data, key) => {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, Buffer.alloc(16, 0));
  let encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return encrypted;
};

const loadKey = async (date, tableName) => {
  const result = await dynamoDB
    .get({
      TableName: tableName,
      Key: { date: date },
    })
    .promise();

  return result.Item ? result.Item.ciphertext_blob : null;
};

exports.handler = async (event) => {
  const tableName = process.env.KEY_TABLE;
  const sourceBucketName = process.env.SOURCE_BUCKET;
  const currentDate = event.date;

  const previousDate = new Date(
    new Date(currentDate).setDate(new Date(currentDate).getDate() - 1)
  )
    .toISOString()
    .split("T")[0];
  const previousCiphertextBlob = await loadKey(previousDate, tableName);
  const currentCiphertextBlob = await loadKey(currentDate, tableName);

  const previousPlaintextKey = previousCiphertextBlob
    ? (
        await kms
          .decrypt({
            CiphertextBlob: Buffer.from(previousCiphertextBlob, "base64"),
          })
          .promise()
      ).Plaintext
    : null;

  const currentPlaintextKey = (
    await kms
      .decrypt({ CiphertextBlob: Buffer.from(currentCiphertextBlob, "base64") })
      .promise()
  ).Plaintext;

  for (const fileKey of event.batch) {
    const fileObject = await s3
      .getObject({
        Bucket: sourceBucketName,
        Key: fileKey,
      })
      .promise();

    let decryptedData;
    if (previousPlaintextKey) {
      decryptedData = decryptData(fileObject.Body, previousPlaintextKey);
    } else {
      decryptedData = fileObject.Body;
    }

    const encryptedData = encryptData(decryptedData, currentPlaintextKey);

    await s3
      .putObject({
        Bucket: sourceBucketName,
        Key: fileKey,
        Body: encryptedData,
      })
      .promise();
  }

  return {
    statusCode: 200,
    body: JSON.stringify("Files processed with new encryption key."),
  };
};
