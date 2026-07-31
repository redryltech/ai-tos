package main

import (
	"log"
	"net/http"
	"os"

	"github.com/ai-tos/news-worker/internal/consumer"
	"github.com/ai-tos/news-worker/internal/health"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "4300"
	}
	http.HandleFunc("/health", health.Handler("news-worker"))
	go consumer.Start()
	log.Printf("news-worker listening on :%s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
