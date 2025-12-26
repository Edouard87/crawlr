TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MThhMWNlMTY1ODc4ZGExYzdjYThjZSIsIm5hbWUiOiJUZXN0IiwiaWF0IjoxNzYzMjI1OTI5fQ.3vneRxPJv_M3zDtSkgkFyYtzUjN3agZpNivkd5TRTQQ"

# Create bar with proper JSON payload. Single-quote the whole JSON to avoid shell interpolation.
curl -X POST \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer $TOKEN" \
   -d '{
      "name": "BARRRR",
      "address": {
         "street": "123 Main St",
         "city": "Montreal",
         "state": "QC",
         "zipCode": "HHHHHH",
         "country": "Canada",
         "coordinates": {
            "latitude": "111123",
            "longitude": "-733333"
         }
      }
   }' \
   http://localhost:3000/api/bar