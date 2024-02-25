# Exploding Kittens

## Frontend
- Install dependencies: `npm i`
- Run development server: `npm run dev`

## Backend
- Install Go if you haven't already: [Go Installation Guide](https://golang.org/doc/install)
- Install Redis if you haven't already: [Redis Download](https://redis.io/download)
- Install required Go packages:
- go get github.com/go-redis/redis/v8
- go get github.com/rs/cors
- Navigate to the backend directory: `cd backend`
- Run the server: `go run server.js`

### Endpoints
- **POST** `/user`: Create a new user. Requires a JSON object with username, email, and password fields in the request body.
- **GET** `/users`: Get details of all users.
- **POST** `/login`: Log in with a username and password. Requires a JSON object with username and password fields in the request body.
- **GET** `/leaderboard`: Get the leaderboard of users sorted by score.
- **POST** `/:username/won`: Increment the score for the specified user by 1.

## Tech Stack
- Go
- Redis
- React
