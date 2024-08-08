# Daily Encryption Process

This project implements a daily encryption process for files stored in an AWS S3 bucket. It uses AWS Lambda functions, Step Functions, KMS, and DynamoDB to manage encryption keys and process files on a daily way.

## Features

- Daily generation of new encryption keys
- Automatic re-encryption of files with the latest key
- Secure key management using AWS KMS
- Scalable file processing using AWS Step Functions
- API endpoint to retrieve the current encryption key

## Architecture

The project consists of the following components:

1. Lambda Functions:
   - `createKey`: Generates a new encryption key daily
   - `listFiles`: Lists files in the S3 bucket for processing
   - `processFiles`: Re-encrypts files using the new key
   - `getKeys`: Retrieves the current encryption key (API endpoint)

2. Step Functions:
   - `DailyEncryptionProcessStateMachine`: Orchestrates the daily encryption process

3. AWS Services:
   - S3: Stores the encrypted files
   - DynamoDB: Stores encryption key metadata
   - KMS: Manages encryption keys
   - EventBridge: Triggers the daily process

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure AWS credentials and region.

3. Deploy the project using Serverless Framework:
   ```
   serverless deploy --stage <stage_name>
   ```

## Usage

The daily encryption process runs automatically at 03:09 UTC every day. To manually retrieve the current encryption key, use the following API endpoint: `GET /keys`
This endpoint returns the current encryption key in base64 format.

## Local Development

For local development and testing, you can use the following npm script to format your code:

   ```
   npm run format
   ```


## Security

This project uses AWS KMS for key management and encryption. Ensure that you have proper IAM permissions set up and that you're following AWS security best practices.
