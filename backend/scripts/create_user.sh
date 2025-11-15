curl -X POST -H "Content-Type: application/json" \
-d '{"email": testing1@gmail.com, \
     "signInCode": eventCode.trim().toUpperCase(), \
      "phoneNumber": "5146696669",
      "passsword": "testing123",
      "name": "Test"}' http://example.com/api/endpoint