MCD (Modèle Conceptuel de Données)

Entities:

1. User
   - id
   - lastName
   - firstName
   - email
   - password

2. Event
   - id
   - name
   - date
   - location
   - type
   - organizerId

3. Participant
   - id
   - status
   - userId
   - eventId

4. Resource
   - id
   - name
   - category
   - suggestedQuantity
   - eventId

5. Contribution
   - id
   - participantId
   - resourceId
   - quantity
