package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/benjamingetches/govtrack/api/routes"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Set up MongoDB connection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Replace with your MongoDB connection string
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	log.Println("Connecting to MongoDB at", mongoURI)
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Println("Error connecting to MongoDB:", err)
		log.Println("Make sure MongoDB is installed and running.")
		log.Println("You can download MongoDB from: https://www.mongodb.com/try/download/community")
		log.Println("Or use MongoDB Atlas cloud service.")
		log.Fatal("Exiting due to database connection error")
	}

	// Ping the database to verify connection
	pingCtx, pingCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer pingCancel()

	if err := client.Ping(pingCtx, nil); err != nil {
		log.Println("Error connecting to MongoDB:", err)
		log.Println("Make sure MongoDB is installed and running.")
		log.Println("You can download MongoDB from: https://www.mongodb.com/try/download/community")
		log.Println("Or use MongoDB Atlas cloud service.")
		log.Fatal("Exiting due to database connection error")
	}

	log.Println("Successfully connected to MongoDB")
	defer client.Disconnect(ctx)

	// Initialize router
	r := mux.NewRouter()

	// Register routes
	routes.SetupRoutes(r, client)

	// CORS middleware
	corsMiddleware := handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"}),
	)

	// Set up server
	srv := &http.Server{
		Addr:         ":" + getPort(),
		WriteTimeout: time.Second * 15,
		ReadTimeout:  time.Second * 15,
		IdleTimeout:  time.Second * 60,
		Handler:      corsMiddleware(r),
	}

	// Start server
	go func() {
		log.Println("Starting server on port", getPort())
		if err := srv.ListenAndServe(); err != nil {
			log.Println(err)
		}
	}()

	// Graceful shutdown
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	<-c

	ctx, cancel = context.WithTimeout(context.Background(), time.Second*15)
	defer cancel()
	srv.Shutdown(ctx)
	log.Println("Server gracefully stopped")
}

func getPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	return port
}
