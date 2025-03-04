package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/benjamingetches/govtrack/api/models"
	"github.com/form3tech-oss/jwt-go"
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

	var loginReq models.LoginRequest
	err := json.NewDecoder(r.Body).Decode(&loginReq)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Find user by email
	var user models.User
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = h.collection.FindOne(ctx, bson.M{"email": loginReq.Email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Check password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginReq.Password))
	if err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// Generate JWT token
	token, err := generateJWT(user)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	// Remove password from response
	user.Password = ""

	// Return token and user
	response := models.AuthResponse{
		Token: token,
		User:  user,
	}

	json.NewEncoder(w).Encode(response)
}

// Register handles user registration
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var registerReq models.RegisterRequest
	err := json.NewDecoder(r.Body).Decode(&registerReq)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate input
	if registerReq.Email == "" || registerReq.Password == "" || registerReq.Name == "" {
		http.Error(w, "Name, email, and password are required", http.StatusBadRequest)
		return
	}

	// Check if user already exists
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var existingUser models.User
	err = h.collection.FindOne(ctx, bson.M{"email": registerReq.Email}).Decode(&existingUser)
	if err == nil {
		http.Error(w, "Email already in use", http.StatusConflict)
		return
	} else if err != mongo.ErrNoDocuments {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(registerReq.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	// Create new user
	now := time.Now()
	newUser := models.User{
		ID:        primitive.NewObjectID(),
		Name:      registerReq.Name,
		Email:     registerReq.Email,
		Password:  string(hashedPassword),
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Insert user into database
	_, err = h.collection.InsertOne(ctx, newUser)
	if err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// Generate JWT token
	token, err := generateJWT(newUser)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	// Remove password from response
	newUser.Password = ""

	// Return token and user
	response := models.AuthResponse{
		Token: token,
		User:  newUser,
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// generateJWT generates a JWT token for the user
func generateJWT(user models.User) (string, error) {
	// Get JWT secret from environment
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return "", fmt.Errorf("JWT_SECRET environment variable not set")
	}

	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": user.ID.Hex(),
		"email":  user.Email,
		"name":   user.Name,
		"exp":    time.Now().Add(time.Hour * 24 * 7).Unix(), // Token expires in 7 days
	})

	// Sign token with secret
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
} 