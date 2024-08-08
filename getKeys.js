const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const kms = new AWS.KMS();

exports.handler = async (event) => {
    const currentDate = new Date().toISOString().split("T")[0];
    const tableName = process.env.KEY_TABLE;

    const result = await dynamoDB
        .get({
            TableName: tableName,
            Key: { date: currentDate },
        })
        .promise();

    if (!result.Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: "Key not found" }),
        };
    }

    const ciphertextBlob = result.Item.ciphertext_blob;

    const decryptedKey = await kms
        .decrypt({
            CiphertextBlob: Buffer.from(ciphertextBlob, "base64"),
        })
        .promise();

    const plaintextKey = decryptedKey.Plaintext.toString("base64");

    return {
        statusCode: 200,
        body: JSON.stringify({ encryption_key: plaintextKey }),
    };
};
