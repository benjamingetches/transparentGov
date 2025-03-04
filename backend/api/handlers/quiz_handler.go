package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// QuizHandler handles quiz-related API endpoints
type QuizHandler struct {
	collection               *mongo.Collection
	userCollection           *mongo.Collection
	representativeCollection *mongo.Collection
}

// NewQuizHandler creates a new QuizHandler
func NewQuizHandler(client *mongo.Client) *QuizHandler {
	collection := client.Database("govtrack").Collection("quizzes")
	userCollection := client.Database("govtrack").Collection("users")
	representativeCollection := client.Database("govtrack").Collection("representatives")
	return &QuizHandler{
		collection:               collection,
		userCollection:           userCollection,
		representativeCollection: representativeCollection,
	}
}

// GetQuiz handles GET requests for a single quiz
func (h *QuizHandler) GetQuiz(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var quiz bson.M
	err = h.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&quiz)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Quiz not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(quiz)
}

// GetQuizzes handles GET requests for quizzes with optional filtering
func (h *QuizHandler) GetQuizzes(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Parse query parameters for filtering
	query := bson.M{}

	// Filter by category if provided
	if category := r.URL.Query().Get("category"); category != "" {
		query["category"] = category
	}

	// Filter by topic if provided
	if topic := r.URL.Query().Get("topic"); topic != "" {
		query["topic"] = topic
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

	var quizzes []bson.M
	if err = cursor.All(ctx, &quizzes); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(quizzes)
}

// CreateQuiz handles POST requests to create a new quiz
func (h *QuizHandler) CreateQuiz(w http.ResponseWriter, r *http.Request) {
	var quiz bson.M
	if err := json.NewDecoder(r.Body).Decode(&quiz); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Generate a new ID if not provided
	if _, ok := quiz["_id"]; !ok {
		quiz["_id"] = primitive.NewObjectID()
	}

	result, err := h.collection.InsertOne(ctx, quiz)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	quiz["_id"] = result.InsertedID

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(quiz)
}

// UpdateQuiz handles PUT requests to update a quiz
func (h *QuizHandler) UpdateQuiz(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	var quiz bson.M
	if err := json.NewDecoder(r.Body).Decode(&quiz); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Ensure ID matches path parameter
	quiz["_id"] = id

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := h.collection.ReplaceOne(ctx, bson.M{"_id": id}, quiz)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "Quiz not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(quiz)
}

// DeleteQuiz handles DELETE requests to remove a quiz
func (h *QuizHandler) DeleteQuiz(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
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
		http.Error(w, "Quiz not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// SubmitQuizResults handles POST requests to submit quiz results
func (h *QuizHandler) SubmitQuizResults(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	quizID, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	var results bson.M
	if err := json.NewDecoder(r.Body).Decode(&results); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Set quiz ID from path parameter
	results["quiz_id"] = quizID

	// Generate a new ID if not provided
	if _, ok := results["_id"]; !ok {
		results["_id"] = primitive.NewObjectID()
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// First check if the quiz exists
	var quiz bson.M
	err = h.collection.FindOne(ctx, bson.M{"_id": quizID}).Decode(&quiz)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Quiz not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Calculate alignment with representatives
	// This is a simplified version - in a real app, this would be more complex
	if answers, ok := results["answers"].([]interface{}); ok && len(answers) > 0 {
		// Get all representatives
		repCursor, err := h.representativeCollection.Find(ctx, bson.M{})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer repCursor.Close(ctx)

		var representatives []bson.M
		if err = repCursor.All(ctx, &representatives); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Calculate alignment for each representative
		// This is a simplified algorithm
		representativeAlignment := []bson.M{}
		for _, rep := range representatives {
			// In a real app, you would compare the user's answers with the representative's stances
			// For now, we'll just create a placeholder alignment
			alignment := bson.M{
				"representative_id":   rep["_id"],
				"representative_name": rep["name"],
				"alignment_score":     0.5, // Placeholder score
			}
			representativeAlignment = append(representativeAlignment, alignment)
		}
		results["representative_alignment"] = representativeAlignment
	}

	// Save the results
	resultsCollection := h.collection.Database().Collection("quiz_results")
	_, err = resultsCollection.InsertOne(ctx, results)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// If user ID is provided, update the user's quiz results
	if userID, ok := results["user_id"].(primitive.ObjectID); ok {
		update := bson.M{
			"$push": bson.M{
				"quiz_results": results["_id"],
			},
		}
		_, err = h.userCollection.UpdateOne(ctx, bson.M{"_id": userID}, update)
		if err != nil {
			// Log the error but don't fail the request
			// The quiz results are still saved
			// In a real app, you might want to handle this differently
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(results)
}

// GetQuizResults handles GET requests for quiz results
func (h *QuizHandler) GetQuizResults(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resultID, err := primitive.ObjectIDFromHex(vars["result_id"])
	if err != nil {
		http.Error(w, "Invalid result ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	resultsCollection := h.collection.Database().Collection("quiz_results")
	var result bson.M
	err = resultsCollection.FindOne(ctx, bson.M{"_id": resultID}).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Quiz result not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// GetUserQuizResults handles GET requests for a user's quiz results
func (h *QuizHandler) GetUserQuizResults(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := primitive.ObjectIDFromHex(vars["user_id"])
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// First check if the user exists
	var user bson.M
	err = h.userCollection.FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the user's quiz results
	resultsCollection := h.collection.Database().Collection("quiz_results")
	cursor, err := resultsCollection.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}
