package middleware

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/form3tech-oss/jwt-go"
)

// LocalClaims represents the claims in a JWT token
type LocalClaims struct {
	UserID string `json:"userId"`
	Email  string `json:"email"`
	Name   string `json:"name"`
	jwt.StandardClaims
}

// VerifyJWT is a middleware that checks for a valid JWT token
func VerifyJWT(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header is required", http.StatusUnauthorized)
			return
		}

		bearerToken := strings.Split(authHeader, " ")
		if len(bearerToken) != 2 || bearerToken[0] != "Bearer" {
			http.Error(w, "Invalid authorization header", http.StatusUnauthorized)
			return
		}

		tokenString := bearerToken[1]

		// Parse the token
		token, err := jwt.ParseWithClaims(tokenString, &LocalClaims{}, func(token *jwt.Token) (interface{}, error) {
			// Make sure the token method conforms to "SigningMethodHMAC"
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			
			// Get the secret key from environment variable
			jwtSecret := os.Getenv("JWT_SECRET")
			if jwtSecret == "" {
				return nil, errors.New("JWT_SECRET environment variable not set")
			}
			
			return []byte(jwtSecret), nil
		})

		if err != nil {
			log.Printf("Error parsing token: %v", err)
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(*LocalClaims)
		if !ok || !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Add user information to request context
		ctx := context.WithValue(r.Context(), "userId", claims.UserID)
		ctx = context.WithValue(ctx, "email", claims.Email)
		ctx = context.WithValue(ctx, "name", claims.Name)
		
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
