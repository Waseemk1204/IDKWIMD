# Use Node.js 18 LTS on Debian (has pre-built spaCy wheels)
FROM node:18-slim

# Install Python and curl for resume parsing and healthcheck
# Using Debian instead of Alpine because spaCy has pre-built wheels
RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  python3-venv \
  curl \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Set up Python virtual environment for resume parser
RUN cd python-services && \
  python3 -m venv venv && \
  ./venv/bin/pip install --upgrade pip && \
  ./venv/bin/pip install --no-cache-dir -r requirements.txt && \
  ./venv/bin/pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.5.0/en_core_web_sm-3.5.0-py3-none-any.whl

# Build TypeScript
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Start the application
CMD ["npm", "start"]