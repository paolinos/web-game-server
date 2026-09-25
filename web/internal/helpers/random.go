package helpers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
)

func GenerateRandomHex(n int, startWith *string) string {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		return ""
	}

	if startWith != nil {
		return fmt.Sprint("%s_%s", startWith, hex.EncodeToString(bytes))
	}

	return hex.EncodeToString(bytes)
}
