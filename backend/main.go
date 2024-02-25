package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/rs/cors"
)

var (
	redisClient *redis.Client
	cookieName  = "session_token"
)

type User struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Score    int    `json:"score"`
}

func main() {
	// redis connection
	redisClient = redis.NewClient(&redis.Options{
		Addr:     "redis-13855.c301.ap-south-1-1.ec2.cloud.redislabs.com:13855",
		Password: "SETshPFj6PorZcihoMwDauOrKvmjwfgo",
		DB:       0, // Use default DB
	})

	pong, err := redisClient.Ping(redisClient.Context()).Result()
	if err != nil {
		panic(err)
	}
	fmt.Println("Connected to Redis:", pong)

	//  HTTP handlers
	mux := http.NewServeMux()
	mux.HandleFunc("/", handler)
	mux.HandleFunc("/user", createUser)
	mux.HandleFunc("/users", getUsers)
	mux.HandleFunc("/login", login)
	mux.HandleFunc("/logout", logout)
	mux.HandleFunc("/leaderboard", leaderboard)
	mux.HandleFunc("/delete", deleteUser)
	mux.HandleFunc("/won/", won)

	//  CORS middleware
	c := cors.AllowAll()

	// sever starting
	port := ":3000"
	fmt.Printf("Server is running on http://localhost%s\n", port)
	http.ListenAndServe(port, c.Handler(mux))
}

func handler(w http.ResponseWriter, r *http.Request) {
	// Set a value in Redis
	err := redisClient.Set(redisClient.Context(), "hello", "world", 0).Err()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the value from Redis
	val, err := redisClient.Get(redisClient.Context(), "hello").Result()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return the value to the client
	fmt.Fprintf(w, "Value from Redis: %s\n", val)
}

func createUser(w http.ResponseWriter, r *http.Request) {
	var user User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// username check if exists
	if exists, _ := redisClient.Exists(redisClient.Context(), user.Username).Result(); exists == 1 {
		http.Error(w, "Username already exists", http.StatusBadRequest)
		return
	}

	// save user to db
	user.Score = 0
	err = saveUser(user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Fprint(w, "User created successfully")
}

// to get all the users
func getUsers(w http.ResponseWriter, r *http.Request) {
	keys, err := redisClient.Keys(redisClient.Context(), "*").Result()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// user details for each key
	var users []User
	for _, key := range keys {
		userData, err := redisClient.Get(redisClient.Context(), key).Result()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var user User
		err = json.Unmarshal([]byte(userData), &user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		users = append(users, user)
	}

	jsonData, err := json.Marshal(users)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func saveUser(user User) error {
	userData, err := json.Marshal(user)
	if err != nil {
		return err
	}

	err = redisClient.Set(redisClient.Context(), user.Username, userData, 0).Err()
	if err != nil {
		return err
	}

	return nil
}

func login(w http.ResponseWriter, r *http.Request) {
	var user User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Check if username exists
	userData, err := redisClient.Get(redisClient.Context(), user.Username).Result()
	if err != nil {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	err = json.Unmarshal([]byte(userData), &user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Check if password matches
	if user.Password != user.Password {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	// Set a cookie with the username
	expiration := time.Now().Add(24 * time.Hour) // Cookie expires in 24 hours
	cookie := http.Cookie{Name: cookieName, Value: user.Username, Expires: expiration}
	http.SetCookie(w, &cookie)

	fmt.Fprintf(w, "Logged in as %s", user.Username)
}

func logout(w http.ResponseWriter, r *http.Request) {
	// Clear the cookie
	cookie := http.Cookie{Name: cookieName, Value: "", Expires: time.Unix(0, 0)}
	http.SetCookie(w, &cookie)

	fmt.Fprint(w, "Logged out")
}

func leaderboard(w http.ResponseWriter, r *http.Request) {
	keys, err := redisClient.Keys(redisClient.Context(), "*").Result()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var users []User
	for _, key := range keys {
		userData, err := redisClient.Get(redisClient.Context(), key).Result()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var user User
		err = json.Unmarshal([]byte(userData), &user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		users = append(users, user)
	}

	// Sort users by score (descending)
	sort.Slice(users, func(i, j int) bool {
		return users[i].Score > users[j].Score
	})

	jsonData, err := json.Marshal(users)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func deleteUser(w http.ResponseWriter, r *http.Request) {
	username := r.FormValue("username")

	// Check if user exists
	exists, err := redisClient.Exists(redisClient.Context(), username).Result()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if exists == 0 {
		http.Error(w, "User does not exist", http.StatusNotFound)
		return
	}

	// Delete user from db
	err = redisClient.Del(redisClient.Context(), username).Err()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "User %s deleted successfully", username)
}

func won(w http.ResponseWriter, r *http.Request) {
	// Extract username from URL parameter
	username := r.URL.Path[len("/won/"):]

	// Check if the user exists
	exists, err := redisClient.Exists(redisClient.Context(), username).Result()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if exists == 0 {
		http.Error(w, "User does not exist", http.StatusNotFound)
		return
	}

	// Get user data
	userData, err := redisClient.Get(redisClient.Context(), username).Result()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var user User
	err = json.Unmarshal([]byte(userData), &user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Increment the score
	user.Score++

	// Save updated user data to db
	err = saveUser(user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "Score of user %s incremented to %d", user.Username, user.Score)
}
