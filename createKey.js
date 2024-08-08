const AWS = require("aws-sdk");
const kms = new AWS.KMS();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const currentDate = new Date().toISOString().split("T")[0];
    const tableName = process.env.KEY_TABLE;

    const keyData = await kms
        .generateDataKey({
            KeyId: process.env.KMS_KEY_ID,
            KeySpec: "AES_256",
        })
        .promise();

    const keyInfo = {
        date: currentDate,
        ciphertext_blob: keyData.CiphertextBlob.toString("base64"),
    };

    await dynamoDB
        .put({
            TableName: tableName,
            Item: keyInfo,
        })
        .promise();

    return keyInfo;
};
