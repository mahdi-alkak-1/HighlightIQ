package clipcandidates

import "testing"

func TestAbs(t *testing.T) {
	if abs(-5) != 5 {
		t.Fatalf("expected 5")
	}
	if abs(4) != 4 {
		t.Fatalf("expected 4")
	}
}
