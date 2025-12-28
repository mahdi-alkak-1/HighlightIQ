package main

import (
	"log"
	"net/http"

	"highlightiq-server/internal/config"
	"highlightiq-server/internal/db"
	authhandlers "highlightiq-server/internal/http/handlers/auth"
	"highlightiq-server/internal/http/router"
	"highlightiq-server/internal/repos/users"
	authsvc "highlightiq-server/internal/services/auth"
)

func main() {
	cfg := config.Load()

	conn, err := db.NewMySQL(cfg.MySQL)
	if err != nil {
		log.Fatalf("DB connection failed: %v", err)
	}
	defer conn.Close()

	usersRepo := users.New(conn)
	authService := authsvc.New(usersRepo, cfg.JWTSecret)
	authHandler := authhandlers.New(authService)

	r := router.New(authHandler)

	log.Println("API listening on :8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
