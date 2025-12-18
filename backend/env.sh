#!/bin/bash

export APP_NAME="DebateHub API"
export APP_VERSION="1.0.0"
export DEBUG="false"

export DATABASE_URL="postgresql://debateuser:debatepassword@localhost:5432/debatehub"
export JWT_SECRET_KEY="your-super-secret-jwt-key-change-this-in-production"
export JWT_ALGORITHM="HS256"
export ACCESS_TOKEN_EXPIRE_MINUTES="43200"

export REDIS_HOST="localhost"
export REDIS_PORT="6379"
export REDIS_DB="0"

export CORS_ORIGINS='["http://localhost:3000","http://localhost:5173"]'

export API_PREFIX="/api/v1"

export AI_API_KEY="your-ai-api-key"
export AI_MODEL="gpt-3.5-turbo"

export AWS_ACCESS_KEY_ID="your-aws-access-key"
export AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
export AWS_REGION="us-east-1"
export AWS_S3_BUCKET="your-bucket-name"

export LOG_LEVEL="INFO"

echo "Environment variables loaded successfully!"
