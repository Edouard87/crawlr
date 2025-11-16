TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MThhMWNlMTY1ODc4ZGExYzdjYThjZSIsIm5hbWUiOiJUZXN0IiwiaWF0IjoxNzYzMzAxNDk1fQ.oN4eBh8xLOyzkAS8V8qkdjF6ajjxi0tnjLl10Tiipws"
curl -X GET -H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" http://localhost:3000/api/event

