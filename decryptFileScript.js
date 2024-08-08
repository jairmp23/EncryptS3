const crypto = require("crypto");
const fs = require("fs");

/**
 * Decrypts the given data using the provided key.
 * @param {Buffer} data - The data to decrypt.
 * @param {string} key - The key used for decryption.
 * @returns {Buffer} - The decrypted data.
 */
const decryptData = (data, key) => {
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key, "base64"), Buffer.alloc(16, 0));
    let decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted;
};

/**
 * Decrypts the file at the specified filePath using the given key.
 * @param {string} filePath - The path to the encrypted file.
 * @param {string} key - The key used for decryption.
 */
const decryptFile = (filePath, key) => {
    const encryptedData = fs.readFileSync(filePath);
    const decryptedData = decryptData(encryptedData, key);
    fs.writeFileSync(filePath.replace(".enc", ""), decryptedData);
};

const encryptionKey = "";
const encryptedFilePath = "";

decryptFile(encryptedFilePath, encryptionKey);

console.log("File decrypted successfully.");
