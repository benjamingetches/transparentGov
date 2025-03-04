package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// PoliticalQuiz represents a quiz to determine political stances
type PoliticalQuiz struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description" json:"description"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
	Questions   []QuizQuestion     `bson:"questions" json:"questions"`
	Categories  []string           `bson:"categories" json:"categories"`
	Version     string             `bson:"version" json:"version"`
}

// QuizQuestion represents a question in a political quiz
type QuizQuestion struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Text        string             `bson:"text" json:"text"`
	Category    string             `bson:"category" json:"category"` // e.g., "economic", "social", "foreign policy"
	Description string             `bson:"description,omitempty" json:"description,omitempty"`
	Options     []QuizOption       `bson:"options,omitempty" json:"options,omitempty"`
	// For Likert scale questions (strongly disagree to strongly agree)
	IsLikertScale bool `bson:"is_likert_scale" json:"is_likert_scale"`
	// Representative stances on this question
	RepresentativeStances []RepresentativeStance `bson:"representative_stances,omitempty" json:"representative_stances,omitempty"`
}

// QuizOption represents an option for a quiz question
type QuizOption struct {
	ID    primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Text  string             `bson:"text" json:"text"`
	Value int                `bson:"value" json:"value"` // Numerical value for scoring
}

// RepresentativeStance represents a representative's stance on a quiz question
type RepresentativeStance struct {
	RepresentativeID primitive.ObjectID `bson:"representative_id" json:"representative_id"`
	Stance           int                `bson:"stance" json:"stance"` // Scale from 1-5 or similar
	Source           string             `bson:"source,omitempty" json:"source,omitempty"`
	Date             time.Time          `bson:"date,omitempty" json:"date,omitempty"`
	Comments         string             `bson:"comments,omitempty" json:"comments,omitempty"`
}

// QuizResult represents a user's result on a political quiz
type QuizResult struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID     primitive.ObjectID `bson:"user_id" json:"user_id"`
	QuizID     primitive.ObjectID `bson:"quiz_id" json:"quiz_id"`
	TakenAt    time.Time          `bson:"taken_at" json:"taken_at"`
	Responses  []QuizResponse     `bson:"responses" json:"responses"`
	Categories map[string]float64 `bson:"categories" json:"categories"` // Category scores
	// Alignment with representatives
	RepresentativeAlignment []RepresentativeAlignment `bson:"representative_alignment,omitempty" json:"representative_alignment,omitempty"`
}

// RepresentativeAlignment represents how closely a user's quiz results align with a representative
type RepresentativeAlignment struct {
	RepresentativeID primitive.ObjectID `bson:"representative_id" json:"representative_id"`
	OverallScore     float64            `bson:"overall_score" json:"overall_score"` // 0-100% alignment
	CategoryScores   map[string]float64 `bson:"category_scores,omitempty" json:"category_scores,omitempty"`
} 