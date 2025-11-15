TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MThhMWNlMTY1ODc4ZGExYzdjYThjZSIsIm5hbWUiOiJUZXN0IiwiaWF0IjoxNzYzMjQyODQxfQ.pKHQx29hcfuwLVzWTSzIHrYLwJJxHK31zfo0-5yOj3E"
curl -X GET -H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" http://localhost:3000/api/event

