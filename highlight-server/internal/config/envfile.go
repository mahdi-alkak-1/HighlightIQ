package config

import (
	"os"
	"strings"
)

func LoadDotEnv(path string) {
	b, err := os.ReadFile(path)
	if err != nil {
		return
	}

	lines := strings.Split(string(b), "\n")
	for _, raw := range lines {
		line := strings.TrimSpace(raw)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		if key == "" {
			continue
		}
		if _, ok := os.LookupEnv(key); ok {
			continue
		}
		value := strings.TrimSpace(parts[1])
		_ = os.Setenv(key, value)
	}
}
