# Project Name

Speer Backend Assignment
## Stack

- **Node.js**: Runtime environment for server-side JavaScript.
- **Express.js**: Web application framework for Node.js.
- **MongoDB**: NoSQL database for storing user and note data.
- **Redis**: In-memory data structure store used for rate limiting.

### Rate Limiting

Requests to note-related endpoints are rate-limited to prevent abuse. Rate limiting is handled using Redis. If a user exceeds the rate limit of 50 requests within an hour, the API responds with a `429 Too Many Requests` status code and a JSON object containing an error message.

## Text Indexing for Search Query

The `/api/search` endpoint enables users to search for notes based on keywords. MongoDB's text indexing is used for high-performance search capabilities. The `notes` collection is indexed on the `title` and `content` fields. This allows for efficient text searches and improves the response time for search queries.


## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js installed
- Docker installed (if using Docker)
- We will be using mongodb and redis using docker containers.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/shreyashghadge11/nodejs_backend_redis_rate_limiter
    ```

2. Navigate to the project directory:

    ```bash
    cd nodejs_backend_redis_rate_limiter
    ```

3. Run Docker Compose:

    ```bash
    docker compose up
    ```

4. Set up environment variables:

    Create a `.env` file based on the provided `.env` file in the repo and update the values for Token_Secret and rate limit.

5. Access the application:

    ```bash
    Use postman to query different endpoints.
    ```

## Usage

- Run the application locally: `npm start`
- Access the API at `http://localhost:3000`
- If you dont want to run docker images of mongo and redis you can use hosted solutions and replace the URL in the .env file for the same.




