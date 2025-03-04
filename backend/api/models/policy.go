package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Policy represents a government policy or legislation
type Policy struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Title            string             `bson:"title" json:"title"`
	Description      string             `bson:"description" json:"description"`
	SimplifiedDesc   string             `bson:"simplified_desc" json:"simplified_desc"` // Humanified version
	OriginalText     string             `bson:"original_text" json:"original_text"`
	Status           string             `bson:"status" json:"status"` // e.g., "proposed", "passed", "failed"
	IntroducedDate   time.Time          `bson:"introduced_date" json:"introduced_date"`
	LastUpdated      time.Time          `bson:"last_updated" json:"last_updated"`
	Type             string             `bson:"type" json:"type"` // e.g., "bill", "executive order", "local ordinance"
	Level            string             `bson:"level" json:"level"` // "federal", "state", "local"
	Jurisdiction     Jurisdiction       `bson:"jurisdiction" json:"jurisdiction"`
	Tags             []string           `bson:"tags" json:"tags"`
	Sponsors         []Representative   `bson:"sponsors" json:"sponsors"`
	VotingRecord     []Vote             `bson:"voting_record" json:"voting_record"`
	Sources          []Source           `bson:"sources" json:"sources"`
	RelatedPolicies  []primitive.ObjectID `bson:"related_policies,omitempty" json:"related_policies,omitempty"`
}

// Jurisdiction represents the geographical jurisdiction of a policy
type Jurisdiction struct {
	Country string `bson:"country" json:"country"`
	State   string `bson:"state,omitempty" json:"state,omitempty"`
	County  string `bson:"county,omitempty" json:"county,omitempty"`
	City    string `bson:"city,omitempty" json:"city,omitempty"`
}

// Vote represents a vote on a policy by a representative
type Vote struct {
	RepresentativeID primitive.ObjectID `bson:"representative_id" json:"representative_id"`
	Vote             string             `bson:"vote" json:"vote"` // "yes", "no", "abstain", etc.
	Date             time.Time          `bson:"date" json:"date"`
	Comments         string             `bson:"comments,omitempty" json:"comments,omitempty"`
}

// Source represents a source of information about a policy
type Source struct {
	URL         string    `bson:"url" json:"url"`
	Title       string    `bson:"title" json:"title"`
	PublishedAt time.Time `bson:"published_at,omitempty" json:"published_at,omitempty"`
	Publisher   string    `bson:"publisher,omitempty" json:"publisher,omitempty"`
} 