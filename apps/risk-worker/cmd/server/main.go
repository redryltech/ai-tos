package main

import (
	"log"
	"net/http"
	"os"

	"github.com/ai-tos/risk-worker/internal/consumer"
	"github.com/ai-tos/risk-worker/internal/health"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "4200"
	}
	http.HandleFunc("/health", health.Handler("risk-worker"))
	go consumer.Start()
	log.Printf("risk-worker listening on :%s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
