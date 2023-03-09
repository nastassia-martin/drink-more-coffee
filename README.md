//. 1
Hitta ett sätt att spara reaktionstiden för varje person och runda i t.ex. en array? 

RUNDA 1 EXEMPEL: 
user1.reactiontime = 60 
user2.reactiontime = 120

Spara varje persons reactiontime i en array

//. 2 
När alla 10 reactiontimes finns, dela totalen på tio för att få varje persons average

// 3. 
När vi har ett average, skicka in i result databas som reactionTimeAvg med vilken user den tillhör




// 1. 
När users disconnectar, avsluta rum? 
- Gör socket.on disconnect i socket_controller
- Radera användaren & room
- meddela användaren i frontend och skicka tillbaka till start

// 2. 
När result är skickat till databasen, radera user och gameroom (efter 10st sparade)

// 3. 
