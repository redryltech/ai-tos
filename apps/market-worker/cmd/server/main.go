package main

import (
	"log"
	"net/http"
	"os"

	"github.com/ai-tos/market-worker/internal/consumer"
	"github.com/ai-tos/market-worker/internal/health"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "4100"
	}
	http.HandleFunc("/health", health.Handler("market-worker"))
	go consumer.Start()
	log.Printf("market-worker listening on :%s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
