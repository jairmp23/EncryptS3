const crypto = require("crypto");
const fs = require("fs");

const decryptData = (data, key) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key, "base64"),
    Buffer.alloc(16, 0)
  );
  let decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted;
};

const decryptFile = (filePath, key) => {
  const encryptedData = fs.readFileSync(filePath);
  const decryptedData = decryptData(encryptedData, key);
  fs.writeFileSync(filePath.replace(".enc", ""), decryptedData);
};

const encryptionKey = "";

const encryptedFilePath = "";
decryptFile(encryptedFilePath, encryptionKey);

console.log("Archivo desencriptado correctamente.");
