package websocket

import "encoding/json"

// MessageBase is the minimum structure expected for every WebSocket message.
type MessageBase struct {
	Type string `json:"type"`
}

// ParseMessage unmarshals raw JSON data into a generic map.
// The map preserves the "type" property so callers can route messages.
func ParseMessage(data []byte) (map[string]any, error) {
	var result map[string]any
	if err := json.Unmarshal(data, &result); err != nil {
		return nil, err
	}
	return result, nil
}
