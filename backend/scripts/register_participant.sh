curl -X POST -H "Content-Type: application/json" \
-d '{"username": }`,
        signInCode: eventCode.trim().toUpperCase(),
        group: groupNumber,
        phoneNumber: phoneNumber.trim() || null}' http://example.com/api/endpoint