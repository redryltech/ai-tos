package consumer

import (
	"log"
	"time"
)

// Start is the skeleton scheduler loop. Phase 0: no jobs wired yet.
func Start() {
	log.Println("[scheduler] loop started (skeleton)")
	// Placeholder tick to demonstrate structure; no real jobs scheduled.
	go func() {
		for range time.Tick(time.Minute) {
			log.Println("[scheduler] tick (skeleton)")
		}
	}()
}
