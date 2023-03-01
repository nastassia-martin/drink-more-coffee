När en user joinar, 
kontrollera om det finns ett rum med en person i,
lägg isåfall till user i det rummet, 
annars, skapa nytt rum och lägg till user i det rummet

Går det att sätta maxantal på hur många som finns i ett rum? 

Kolla igenom socket.join(), socket.leave()

Byt autoincr på userid, till bara id och map, för att kunna söka på socket.id istället 

Behöver vi sätta namn på rooms? 

Ändra create till upsert? 


----

Om du är den enda spelaren i ett rum - visa "väntar på spelare" 
När den andra spelaren ansluter - visa "spelare redo" 
