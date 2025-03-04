package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/benjamingetches/govtrack/api/models"
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

// AuthHandler handles authentication requests
type AuthHandler struct {
	collection *mongo.Collection
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(client *mongo.Client) *AuthHandler {
	collection := client.Database("govtrack").Collection("users")
	return &AuthHandler{
		collection: collection,
	}
}

// Login handles user login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Println("Login request received")

	var loginReq models.LoginRequest
	err := json.NewDecoder(r.Body).Decode(&loginReq)
	if err != nil {
		fmt.Printf("Error decoding login request: %v\n", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	fmt.Printf("Login attempt for email: %s\n", loginReq.Email)

	// Find user by email
	var user models.User
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = h.collection.FindOne(ctx, bson.M{"email": loginReq.Email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			fmt.Printf("User not found with email: %s\n", loginReq.Email)
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid email or password"})
			return
		}
		fmt.Printf("Database error finding user: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Database error"})
		return
	}

	// Check password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginReq.Password))
	if err != nil {
		fmt.Println("Password mismatch")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid email or password"})
		return
	}

	fmt.Println("Password verified, generating JWT token")

	// Generate JWT token
	token, err := generateJWT(user)
	if err != nil {
		fmt.Printf("Error generating token: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to generate token"})
		return
	}

	fmt.Println("JWT token generated successfully")

	// Remove password from response
	user.Password = ""

	// Return token and user
	response := models.AuthResponse{
		Token: token,
		User:  user,
	}

	fmt.Println("Sending login response")
	json.NewEncoder(w).Encode(response)
}

// Register handles user registration
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Println("Register request received")

	var registerReq models.RegisterRequest
	err := json.NewDecoder(r.Body).Decode(&registerReq)
	if err != nil {
		fmt.Printf("Error decoding register request: %v\n", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	// Validate input
	if registerReq.Email == "" || registerReq.Password == "" || registerReq.Name == "" {
		fmt.Println("Missing required fields in registration")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Name, email, and password are required"})
		return
	}

	fmt.Printf("Registration attempt for email: %s\n", registerReq.Email)

	// Check if user already exists
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var existingUser models.User
	err = h.collection.FindOne(ctx, bson.M{"email": registerReq.Email}).Decode(&existingUser)
	if err == nil {
		fmt.Printf("Email already in use: %s\n", registerReq.Email)
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": "Email already in use"})
		return
	} else if err != mongo.ErrNoDocuments {
		fmt.Printf("Database error checking existing user: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Database error"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(registerReq.Password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Printf("Error hashing password: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to hash password"})
		return
	}

	fmt.Println("Password hashed successfully")

	// Create new user
	now := time.Now()
	newUser := models.User{
		ID:        primitive.NewObjectID(),
		Name:      registerReq.Name,
		Email:     registerReq.Email,
		Password:  string(hashedPassword),
		CreatedAt: now,
		UpdatedAt: now,
		Location:  models.Location{}, // Initialize with empty location
	}

	// Insert user into database
	_, err = h.collection.InsertOne(ctx, newUser)
	if err != nil {
		fmt.Printf("Error creating user in database: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create user"})
		return
	}

	fmt.Printf("User created successfully with ID: %s\n", newUser.ID.Hex())
	fmt.Println("Generating JWT token")

	// Generate JWT token
	token, err := generateJWT(newUser)
	if err != nil {
		fmt.Printf("Error generating token: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to generate token"})
		return
	}

	fmt.Println("JWT token generated successfully")

	// Remove password from response
	newUser.Password = ""

	// Return token and user
	response := models.AuthResponse{
		Token: token,
		User:  newUser,
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Println("Sending registration response")
	json.NewEncoder(w).Encode(response)
}

// generateJWT generates a JWT token for the user
func generateJWT(user models.User) (string, error) {
	// Get JWT secret from environment
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		// Use a default secret if environment variable is not set
		jwtSecret = "govtrack_jwt_secret_key_for_local_authentication"
		fmt.Println("WARNING: Using default JWT secret. Set JWT_SECRET environment variable for production.")
	}

	// Set expiration time
	expirationTime := time.Now().Add(time.Hour * 24 * 7) // 7 days

	// Create claims with user data
	claims := jwt.MapClaims{
		"userId": user.ID.Hex(),
		"email":  user.Email,
		"name":   user.Name,
		"exp":    expirationTime.Unix(),
	}

	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign token with secret
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		fmt.Printf("Error signing token: %v\n", err)
		return "", err
	}

	return tokenString, nil
} 