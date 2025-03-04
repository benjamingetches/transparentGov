package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/benjamingetches/govtrack/api/models"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// RepresentativeHandler handles representative-related API endpoints
type RepresentativeHandler struct {
	collection *mongo.Collection
}

// NewRepresentativeHandler creates a new RepresentativeHandler
func NewRepresentativeHandler(client *mongo.Client) *RepresentativeHandler {
	collection := client.Database("govtrack").Collection("representatives")
	return &RepresentativeHandler{
		collection: collection,
	}
}

// GetRepresentative handles GET requests for a single representative
func (h *RepresentativeHandler) GetRepresentative(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid representative ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var representative models.Representative
	err = h.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&representative)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Representative not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(representative)
}

// GetRepresentatives handles GET requests for representatives with optional filtering
func (h *RepresentativeHandler) GetRepresentatives(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Parse query parameters for filtering
	query := bson.M{}

	// Filter by state if provided
	if state := r.URL.Query().Get("state"); state != "" {
		query["state"] = state
	}

	// Filter by party if provided
	if party := r.URL.Query().Get("party"); party != "" {
		query["party"] = party
	}

	// Filter by title if provided
	if title := r.URL.Query().Get("title"); title != "" {
		query["title"] = title
	}

	// Set up options for pagination
	findOptions := options.Find()
	if limit := r.URL.Query().Get("limit"); limit != "" {
		limitInt := 10 // default limit
		// Parse limit from query parameter
		// Omitting error handling for brevity
		findOptions.SetLimit(int64(limitInt))
	}

	cursor, err := h.collection.Find(ctx, query, findOptions)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var representatives []models.Representative
	if err = cursor.All(ctx, &representatives); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(representatives)
}

// CreateRepresentative handles POST requests to create a new representative
func (h *RepresentativeHandler) CreateRepresentative(w http.ResponseWriter, r *http.Request) {
	var representative models.Representative
	if err := json.NewDecoder(r.Body).Decode(&representative); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Generate a new ID if not provided
	if representative.ID.IsZero() {
		representative.ID = primitive.NewObjectID()
	}

	result, err := h.collection.InsertOne(ctx, representative)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	representative.ID = result.InsertedID.(primitive.ObjectID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(representative)
}

// UpdateRepresentative handles PUT requests to update a representative
func (h *RepresentativeHandler) UpdateRepresentative(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid representative ID", http.StatusBadRequest)
		return
	}

	var representative models.Representative
	if err := json.NewDecoder(r.Body).Decode(&representative); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Ensure ID matches path parameter
	representative.ID = id

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := h.collection.ReplaceOne(ctx, bson.M{"_id": id}, representative)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "Representative not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(representative)
}

// DeleteRepresentative handles DELETE requests to remove a representative
func (h *RepresentativeHandler) DeleteRepresentative(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid representative ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := h.collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "Representative not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetRepresentativeVotes handles GET requests for a representative's voting record
func (h *RepresentativeHandler) GetRepresentativeVotes(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid representative ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// First check if the representative exists
	var representative models.Representative
	err = h.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&representative)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Representative not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the policies collection to find votes
	policiesCollection := h.collection.Database().Collection("policies")

	// Find policies where this representative has voted
	pipeline := []bson.M{
		{
			"$match": bson.M{
				"votes.representative_id": id,
			},
		},
		{
			"$project": bson.M{
				"_id":     1,
				"title":   1,
				"summary": 1,
				"vote": bson.M{
					"$filter": bson.M{
						"input": "$votes",
						"as":    "vote",
						"cond": bson.M{
							"$eq": []interface{}{"$$vote.representative_id", id},
						},
					},
				},
			},
		},
	}

	cursor, err := policiesCollection.Aggregate(ctx, pipeline)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var votes []bson.M
	if err = cursor.All(ctx, &votes); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(votes)
}
