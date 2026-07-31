package main

import (
	"log"
	"net/http"
	"os"

	"github.com/ai-tos/scheduler/internal/consumer"
	"github.com/ai-tos/scheduler/internal/health"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "4400"
	}
	http.HandleFunc("/health", health.Handler("scheduler"))
	go consumer.Start()
	log.Printf("scheduler listening on :%s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
