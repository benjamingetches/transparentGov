package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/benjamingetches/govtrack/api/models"
	"github.com/benjamingetches/govtrack/config"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// UserHandler handles user-related API endpoints
type UserHandler struct {
	collection *mongo.Collection
}

// NewUserHandler creates a new UserHandler
func NewUserHandler(client *mongo.Client) *UserHandler {
	collection := config.GetCollection(config.UsersCollection)
	return &UserHandler{
		collection: collection,
	}
}

// GetUser handles GET requests for a single user
func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get user ID from URL
	params := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Find user in database
	var user models.User
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = h.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return user as JSON
	json.NewEncoder(w).Encode(user)
}

// GetUsers handles GET requests to retrieve all users
func (h *UserHandler) GetUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Find all users in database
	var users []models.User
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := h.collection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	// Decode results
	if err = cursor.All(ctx, &users); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return users as JSON
	json.NewEncoder(w).Encode(users)
}

// CreateUser handles POST requests to create a new user
func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Decode request body
	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Set creation and update times
	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now

	// Insert user into database
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := h.collection.InsertOne(ctx, user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Set ID from insert result
	user.ID = result.InsertedID.(primitive.ObjectID)

	// Return created user as JSON
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}

// UpdateUser handles PUT requests to update a user
func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get user ID from URL
	params := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Decode request body
	var user models.User
	err = json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Set update time
	user.UpdatedAt = time.Now()

	// Update user in database
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := h.collection.ReplaceOne(ctx, bson.M{"_id": id}, user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Return updated user as JSON
	user.ID = id
	json.NewEncoder(w).Encode(user)
}

// DeleteUser handles DELETE requests to delete a user
func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get user ID from URL
	params := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Delete user from database
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := h.collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Return success message
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "User deleted successfully"})
}

// GetUserByAuth0ID handles GET requests to find a user by Auth0 ID
func (h *UserHandler) GetUserByAuth0ID(w http.ResponseWriter, r *http.Request) {
	// This method is no longer needed with JWT authentication
	http.Error(w, "Method not supported", http.StatusNotFound)
} 