#!/bin/bash
echo "Initializing LocalStack..."

# Create S3 bucket
awslocal s3 mb s3://artemis-uploads 2>/dev/null || true

# Configure CORS for presigned uploads
awslocal s3api put-bucket-cors --bucket artemis-uploads --cors-configuration '{
  "CORSRules": [{
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }]
}'

# Verify email identity for SES
awslocal ses verify-email-identity --email-address noreply@artemis.app

echo "LocalStack ready!"
