package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Representative represents a government official
type Representative struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name             string             `bson:"name" json:"name"`
	Title            string             `bson:"title" json:"title"` // e.g., "Senator", "Representative", "Governor"
	Party            string             `bson:"party" json:"party"`
	State            string             `bson:"state" json:"state"`
	District         string             `bson:"district,omitempty" json:"district,omitempty"`
	Level            string             `bson:"level" json:"level"` // "federal", "state", "local"
	Office           string             `bson:"office,omitempty" json:"office,omitempty"`
	TermStart        time.Time          `bson:"term_start" json:"term_start"`
	TermEnd          time.Time          `bson:"term_end" json:"term_end"`
	Biography        string             `bson:"biography,omitempty" json:"biography,omitempty"`
	PhotoURL         string             `bson:"photo_url,omitempty" json:"photo_url,omitempty"`
	ContactInfo      ContactInfo        `bson:"contact_info" json:"contact_info"`
	SocialMedia      SocialMedia        `bson:"social_media,omitempty" json:"social_media,omitempty"`
	Committees       []Committee        `bson:"committees,omitempty" json:"committees,omitempty"`
	VotingHistory    []primitive.ObjectID `bson:"voting_history,omitempty" json:"voting_history,omitempty"`
	PoliticalStances []PoliticalStance  `bson:"political_stances,omitempty" json:"political_stances,omitempty"`
}

// ContactInfo represents contact information for a representative
type ContactInfo struct {
	Email       string `bson:"email,omitempty" json:"email,omitempty"`
	Phone       string `bson:"phone,omitempty" json:"phone,omitempty"`
	Website     string `bson:"website,omitempty" json:"website,omitempty"`
	OfficeAddress string `bson:"office_address,omitempty" json:"office_address,omitempty"`
}

// SocialMedia represents social media accounts for a representative
type SocialMedia struct {
	Twitter  string `bson:"twitter,omitempty" json:"twitter,omitempty"`
	Facebook string `bson:"facebook,omitempty" json:"facebook,omitempty"`
	Instagram string `bson:"instagram,omitempty" json:"instagram,omitempty"`
	YouTube  string `bson:"youtube,omitempty" json:"youtube,omitempty"`
}

// Committee represents a committee a representative serves on
type Committee struct {
	Name     string `bson:"name" json:"name"`
	Position string `bson:"position,omitempty" json:"position,omitempty"` // e.g., "Chair", "Member"
}

// PoliticalStance represents a representative's stance on a political issue
type PoliticalStance struct {
	Issue       string    `bson:"issue" json:"issue"`
	Stance      int       `bson:"stance" json:"stance"` // Scale from 1-5 or similar
	Description string    `bson:"description,omitempty" json:"description,omitempty"`
	Source      string    `bson:"source,omitempty" json:"source,omitempty"`
	Date        time.Time `bson:"date,omitempty" json:"date,omitempty"`
} 