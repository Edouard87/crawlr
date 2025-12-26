# curl -X POST -H "Content-Type: application/json" http://localhost:3000/api/bar/

TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MThhMWNlMTY1ODc4ZGExYzdjYThjZSIsIm5hbWUiOiJUZXN0IiwiaWF0IjoxNzYzMjQwNzA0fQ.K7-nGcp2a1b_o8yD97Q2cMK1IyhFOkrZGPjlN_EdQxI
curl -X DELETE -H "Authorization: Bearer $TOKEN"  "http://localhost:3000/api/bar/6918e89dc1f34ddb1f7c2559"