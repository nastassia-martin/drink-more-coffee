När cupClicked är emittad, hämta reaktionstid och jämför, för att ta reda på vem som fick mest



// 1. 
cups ska visas på samma ställe för båda spelarna 
FRÅGA: är vi säkra på att koppen måste vara på exakt samma ställe för båda två? 

// 2. 
känna av vilken spelare som trycker så att vi kan mäta dess reaktionstid och kontrollera vem som ska få poäng

// 3. 
**få en runda att stanna tills den andra spelaren har klickat**
emit cupClicked med users reaktionstid 
skicka in reaktionstid i databasen på user som svarat
hämta ut user.reactionTime i socket_controller, om bägge svarat, skicka callback till 
main.ts att bägge har svarat och att det är ok att starta ny runda

// 4. 
när en runda är klar, visas bägges reaktionstid i timern? 
sen ändras antal rundor nedanför "rutan" och nästa runda startas? 


// emit that im ready to go on to the other player





//. FELSÖKNING 
Vi får två st "showcup events" skickade till frontend, eftersom att vi skickar till roomId (vilket innehåller två st)

