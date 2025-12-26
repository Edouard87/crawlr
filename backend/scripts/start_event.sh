TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MThhMWNlMTY1ODc4ZGExYzdjYThjZSIsIm5hbWUiOiJUZXN0IiwiaWF0IjoxNzYzMzAxMzQ5fQ.0nuUFdk49KGfvEgZwcKW_0w0HEGHwXMSKhHwZsSTwCE"
ID="69199a8f0fff7f38e3dfffde"

curl -X POST -H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" http://localhost:3000/api/event/start/$ID

