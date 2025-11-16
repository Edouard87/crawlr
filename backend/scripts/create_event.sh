TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MThhMWNlMTY1ODc4ZGExYzdjYThjZSIsIm5hbWUiOiJUZXN0IiwiaWF0IjoxNzYzMjIyMDI4fQ.TDd5OFF4whLQo0WGVfqc3wtH32rAsxP1PkwNowTzJdM"
curl -X POST -H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{"eventName": "theCrawl3", "numGroups": "10"}' http://localhost:3000/api/event

