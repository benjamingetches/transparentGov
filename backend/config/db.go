package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Database names
const (
	DatabaseName = "govtrack"
)

// Collection names
const (
	UsersCollection      = "users"
	PoliciesCollection   = "policies"
	RepresentativesCollection = "representatives"
	VotingRecordsCollection  = "voting_records"
	PoliticalQuizzesCollection = "political_quizzes"
)

var (
	Client     *mongo.Client
	DB         *mongo.Database
	err        error
)

// ConnectDB connects to MongoDB
func ConnectDB() error {
	// Get MongoDB URI from environment variable
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}
	
	// Extract database name from URI or use default
	dbName := "govtrack"
	if strings.Contains(mongoURI, "/") {
		parts := strings.Split(mongoURI, "/")
		if len(parts) > 2 {
			dbNameParts := strings.Split(parts[len(parts)-1], "?")
			if dbNameParts[0] != "" {
				dbName = dbNameParts[0]
			}
		}
	}
	
	log.Printf("Connecting to MongoDB at %s", mongoURI)
	
	// Set client options
	clientOptions := options.Client().ApplyURI(mongoURI)
	
	// Connect to MongoDB
	Client, err = mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %v", err)
	}
	
	// Check the connection
	err = Client.Ping(context.TODO(), nil)
	if err != nil {
		return fmt.Errorf("failed to ping MongoDB: %v", err)
	}
	
	log.Println("Successfully connected to MongoDB")
	
	// Initialize the database
	DB = Client.Database(dbName)
	if DB == nil {
		return fmt.Errorf("failed to get database: %s", dbName)
	}
	
	log.Printf("Using database: %s", dbName)
	
	return nil
}

// GetCollection returns a MongoDB collection
func GetCollection(collectionName string) *mongo.Collection {
	if DB == nil {
		log.Println("Warning: Database not initialized, attempting to connect")
		err := ConnectDB()
		if err != nil {
			log.Fatalf("Failed to connect to database: %v", err)
		}
	}
	
	return DB.Collection(collectionName)
}

// DisconnectDB closes the connection to the MongoDB database
func DisconnectDB(client *mongo.Client) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := client.Disconnect(ctx); err != nil {
		log.Printf("Error disconnecting from MongoDB: %v", err)
	}
	log.Println("Disconnected from MongoDB")
} 