package dashboard

type Stage struct {
	ID     string `json:"id"`
	Label  string `json:"label"`
	Status string `json:"status"`
	Count  int64  `json:"count"`
	State  string `json:"state"`
}

type PipelineResponse struct {
	Stages []Stage `json:"stages"`
}
