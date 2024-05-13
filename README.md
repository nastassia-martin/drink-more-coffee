# Drink More Coffee

This is a group assignment built by [Hanna Bjorling](https://github.com/hannabjorling), [Sonja Svidén](https://github.com/sonjasviden), and [Nastassia Martin](https://github.com/nastassia-martin).

Drink More Coffee is a dynamic two-player game that updates in real-time using sockets.io. Players compete to click on a coffee cup before their opponent, with the winner being the person who accumulates the most points during the game.

## Features
### Gameplay: 
- objective: click on the coffee cup before your opponent to score points.
- multiplayer: supports multiple games running simultaneously.
- scoring and timing: calculations, including point scoring and cup positioning, are handled server-side to ensure fairness. A timer displays each player's reaction time.

### User interface:

- username: Users can enter a username at the start of the game.
- lobby: A lobby displays ongoing games and current scores, allowing visitors to observe or join games.
- high scores: The results of the last ten games are stored and displayed in the lobby along with a high score list.

## Tech stack
- Node.js
- Typescript
- Sockets.io
- Prisma
- MongoDB

## Deployed at
[dricka-mer-kaffe](https://dricka-mer-kaffe.netlify.app)
