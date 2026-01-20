package clips

type PublishRequest struct {
	Title         *string `json:"title" validate:"omitempty,min=1,max=120"`
	Description   *string `json:"description" validate:"omitempty,max=5000"`
	PrivacyStatus *string `json:"privacy_status" validate:"omitempty,oneof=public unlisted private"`
}

func (r PublishRequest) Validate() error {
	return validate.Struct(r)
}
