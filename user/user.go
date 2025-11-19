package user

func GetUserName(userID int) string {

	if userID == 1 {
		return "Alice"
	}
	return "Unknown"
}
