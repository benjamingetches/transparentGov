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
	"go.mongodb.org/mongo-driver/mongo/options"
)

// PolicyHandler handles policy-related API endpoints
type PolicyHandler struct {
	collection *mongo.Collection
}

// NewPolicyHandler creates a new PolicyHandler
func NewPolicyHandler(client *mongo.Client) *PolicyHandler {
	collection := config.GetCollection(config.PoliciesCollection)
	return &PolicyHandler{
		collection: collection,
	}
}

// GetPolicy handles GET requests for a single policy
func (h *PolicyHandler) GetPolicy(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get policy ID from URL
	params := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		http.Error(w, "Invalid policy ID", http.StatusBadRequest)
		return
	}

	// Find policy in database
	var policy models.Policy
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = h.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&policy)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Policy not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return policy as JSON
	json.NewEncoder(w).Encode(policy)
}

// GetPolicies handles GET requests for multiple policies with filtering
func (h *PolicyHandler) GetPolicies(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Parse query parameters for filtering
	query := bson.M{}

	// Filter by level (federal, state, local)
	if level := r.URL.Query().Get("level"); level != "" {
		query["level"] = level
	}

	// Filter by jurisdiction
	if state := r.URL.Query().Get("state"); state != "" {
		query["jurisdiction.state"] = state
	}
	if city := r.URL.Query().Get("city"); city != "" {
		query["jurisdiction.city"] = city
	}

	// Filter by status
	if status := r.URL.Query().Get("status"); status != "" {
		query["status"] = status
	}

	// Filter by type
	if policyType := r.URL.Query().Get("type"); policyType != "" {
		query["type"] = policyType
	}

	// Parse pagination parameters
	var limit int64 = 10
	//var page int64 = 1
	var skip int64 = 0

	// Find policies in database
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	options := options.Find()
	options.SetLimit(limit)
	options.SetSkip(skip)
	options.SetSort(bson.M{"introduced_date": -1}) // Sort by introduced date, newest first

	cursor, err := h.collection.Find(ctx, query, options)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	// Decode policies from cursor
	var policies []models.Policy
	if err := cursor.All(ctx, &policies); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return policies as JSON
	json.NewEncoder(w).Encode(policies)
}

// CreatePolicy handles POST requests to create a new policy
func (h *PolicyHandler) CreatePolicy(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Decode request body
	var policy models.Policy
	err := json.NewDecoder(r.Body).Decode(&policy)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Set last updated time
	policy.LastUpdated = time.Now()

	// Insert policy into database
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := h.collection.InsertOne(ctx, policy)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Set ID from insert result
	policy.ID = result.InsertedID.(primitive.ObjectID)

	// Return created policy as JSON
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(policy)
}

// UpdatePolicy handles PUT requests to update a policy
func (h *PolicyHandler) UpdatePolicy(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get policy ID from URL
	params := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		http.Error(w, "Invalid policy ID", http.StatusBadRequest)
		return
	}

	// Decode request body
	var policy models.Policy
	err = json.NewDecoder(r.Body).Decode(&policy)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Set last updated time
	policy.LastUpdated = time.Now()

	// Update policy in database
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := h.collection.ReplaceOne(ctx, bson.M{"_id": id}, policy)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "Policy not found", http.StatusNotFound)
		return
	}

	// Return updated policy as JSON
	policy.ID = id
	json.NewEncoder(w).Encode(policy)
}

// DeletePolicy handles DELETE requests to delete a policy
func (h *PolicyHandler) DeletePolicy(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get policy ID from URL
	params := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		http.Error(w, "Invalid policy ID", http.StatusBadRequest)
		return
	}

	// Delete policy from database
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := h.collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "Policy not found", http.StatusNotFound)
		return
	}

	// Return success message
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Policy deleted successfully"})
}

// GetPoliciesByLocation handles GET requests to find policies by location
func (h *PolicyHandler) GetPoliciesByLocation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Parse location parameters
	state := r.URL.Query().Get("state")
	city := r.URL.Query().Get("city")

	if state == "" {
		http.Error(w, "State parameter is required", http.StatusBadRequest)
		return
	}

	// Build query based on location
	query := bson.M{}
	query["jurisdiction.state"] = state

	if city != "" {
		query["jurisdiction.city"] = city
	}

	// Find policies in database
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	options := options.Find()
	options.SetSort(bson.M{"introduced_date": -1}) // Sort by introduced date, newest first

	cursor, err := h.collection.Find(ctx, query, options)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	// Decode policies from cursor
	var policies []models.Policy
	if err := cursor.All(ctx, &policies); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return policies as JSON
	json.NewEncoder(w).Encode(policies)
}
