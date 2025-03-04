package routes

import (
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/benjamingetches/govtrack/api/handlers"
	"github.com/benjamingetches/govtrack/api/middleware"
)

// SetupRoutes configures all API routes
func SetupRoutes(router *mux.Router, client *mongo.Client) {
	// Health check route
	router.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	}).Methods("GET")

	// Create handlers
	userHandler := handlers.NewUserHandler(client)
	policyHandler := handlers.NewPolicyHandler(client)
	representativeHandler := handlers.NewRepresentativeHandler(client)
	quizHandler := handlers.NewQuizHandler(client)
	authHandler := handlers.NewAuthHandler(client)

	// Auth routes - no authentication required
	authRouter := router.PathPrefix("/api/auth").Subrouter()
	authRouter.HandleFunc("/register", authHandler.Register).Methods("POST")
	authRouter.HandleFunc("/login", authHandler.Login).Methods("POST")

	// User routes - protected with JWT
	userRouter := router.PathPrefix("/api/users").Subrouter()
	userRouter.Use(middleware.VerifyJWT)
	userRouter.HandleFunc("", userHandler.GetUsers).Methods("GET")
	userRouter.HandleFunc("/{id}", userHandler.GetUser).Methods("GET")
	userRouter.HandleFunc("", userHandler.CreateUser).Methods("POST")
	userRouter.HandleFunc("/{id}", userHandler.UpdateUser).Methods("PUT")
	userRouter.HandleFunc("/{id}", userHandler.DeleteUser).Methods("DELETE")

	// Public user routes - no authentication required
	publicUserRouter := router.PathPrefix("/api/public/users").Subrouter()
	publicUserRouter.HandleFunc("/{id}", userHandler.GetUser).Methods("GET")

	// Policy routes - protected with JWT
	policyRouter := router.PathPrefix("/api/policies").Subrouter()
	policyRouter.Use(middleware.VerifyJWT)
	policyRouter.HandleFunc("", policyHandler.CreatePolicy).Methods("POST")
	policyRouter.HandleFunc("", policyHandler.GetPolicies).Methods("GET")
	policyRouter.HandleFunc("/{id}", policyHandler.GetPolicy).Methods("GET")
	policyRouter.HandleFunc("/{id}", policyHandler.UpdatePolicy).Methods("PUT")
	policyRouter.HandleFunc("/{id}", policyHandler.DeletePolicy).Methods("DELETE")
	policyRouter.HandleFunc("/location/{location}", policyHandler.GetPoliciesByLocation).Methods("GET")

	// Public policy routes - no authentication required
	publicPolicyRouter := router.PathPrefix("/api/public/policies").Subrouter()
	publicPolicyRouter.HandleFunc("", policyHandler.GetPolicies).Methods("GET")
	publicPolicyRouter.HandleFunc("/{id}", policyHandler.GetPolicy).Methods("GET")
	publicPolicyRouter.HandleFunc("/location/{location}", policyHandler.GetPoliciesByLocation).Methods("GET")

	// Representative routes - protected with JWT
	repRouter := router.PathPrefix("/api/representatives").Subrouter()
	repRouter.Use(middleware.VerifyJWT)
	repRouter.HandleFunc("", representativeHandler.CreateRepresentative).Methods("POST")
	repRouter.HandleFunc("", representativeHandler.GetRepresentatives).Methods("GET")
	repRouter.HandleFunc("/{id}", representativeHandler.GetRepresentative).Methods("GET")
	repRouter.HandleFunc("/{id}", representativeHandler.UpdateRepresentative).Methods("PUT")
	repRouter.HandleFunc("/{id}", representativeHandler.DeleteRepresentative).Methods("DELETE")
	repRouter.HandleFunc("/{id}/votes", representativeHandler.GetRepresentativeVotes).Methods("GET")

	// Public representative routes - no authentication required
	publicRepRouter := router.PathPrefix("/api/public/representatives").Subrouter()
	publicRepRouter.HandleFunc("", representativeHandler.GetRepresentatives).Methods("GET")
	publicRepRouter.HandleFunc("/{id}", representativeHandler.GetRepresentative).Methods("GET")
	publicRepRouter.HandleFunc("/{id}/votes", representativeHandler.GetRepresentativeVotes).Methods("GET")

	// Quiz routes - protected with JWT
	quizRouter := router.PathPrefix("/api/quizzes").Subrouter()
	quizRouter.Use(middleware.VerifyJWT)
	quizRouter.HandleFunc("", quizHandler.CreateQuiz).Methods("POST")
	quizRouter.HandleFunc("", quizHandler.GetQuizzes).Methods("GET")
	quizRouter.HandleFunc("/{id}", quizHandler.GetQuiz).Methods("GET")
	quizRouter.HandleFunc("/{id}", quizHandler.UpdateQuiz).Methods("PUT")
	quizRouter.HandleFunc("/{id}", quizHandler.DeleteQuiz).Methods("DELETE")
	quizRouter.HandleFunc("/submit", quizHandler.SubmitQuizResults).Methods("POST")
	quizRouter.HandleFunc("/results", quizHandler.GetQuizResults).Methods("GET")
	quizRouter.HandleFunc("/user/{userId}/results", quizHandler.GetUserQuizResults).Methods("GET")

	// Public quiz routes - no authentication required
	publicQuizRouter := router.PathPrefix("/api/public/quizzes").Subrouter()
	publicQuizRouter.HandleFunc("", quizHandler.GetQuizzes).Methods("GET")
	publicQuizRouter.HandleFunc("/{id}", quizHandler.GetQuiz).Methods("GET")
}
