package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User represents a user in the system
type User struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name          string             `bson:"name" json:"name"`
	Email         string             `bson:"email" json:"email"`
	Password      string             `bson:"password,omitempty" json:"password,omitempty"` // Password is omitted from JSON responses
	Location      Location           `bson:"location" json:"location"`
	CreatedAt     time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt     time.Time          `bson:"updated_at" json:"updatedAt"`
	PoliticalQuiz []QuizResponse     `bson:"political_quiz,omitempty" json:"political_quiz,omitempty"`
}

// Location represents a geographical location
type Location struct {
	Address     string `bson:"address,omitempty" json:"address,omitempty"`
	City        string `bson:"city" json:"city"`
	State       string `bson:"state" json:"state"`
	ZipCode     string `bson:"zip_code" json:"zip_code"`
	Coordinates struct {
		Latitude  float64 `bson:"latitude" json:"latitude"`
		Longitude float64 `bson:"longitude" json:"longitude"`
	} `bson:"coordinates,omitempty" json:"coordinates,omitempty"`
	CongressionalDistrict string `bson:"congressional_district,omitempty" json:"congressional_district,omitempty"`
}

// QuizResponse represents a user's response to a political quiz question
type QuizResponse struct {
	QuestionID primitive.ObjectID `bson:"question_id" json:"question_id"`
	Answer     int                `bson:"answer" json:"answer"` // Scale from 1-5 or similar
}

// LoginRequest represents the login request body
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RegisterRequest represents the register request body
type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// AuthResponse represents the authentication response
type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}