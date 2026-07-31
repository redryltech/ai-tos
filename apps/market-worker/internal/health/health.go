package health

import (
	"encoding/json"
	"net/http"
	"time"
)

type response struct {
	Status    string `json:"status"`
	Service   string `json:"service"`
	Version   string `json:"version"`
	Timestamp string `json:"timestamp"`
}

// Handler returns a health endpoint for the given service name.
func Handler(service string) http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(response{
			Status:    "ok",
			Service:   service,
			Version:   "0.0.0",
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		})
	}
}
