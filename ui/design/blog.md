### Farewell BanditChess — Introducing GofChess


Some of you may remember [BanditChess](https://lichess.org/@/heroku/blog/introducing-bandit-chess/QmgstUVO), which we published about a year ago. It's time to say goodbye to it. 

In its place comes a brand new chess project. GofChess.

This is my long-time dream project.

Imagine a language to express tactical ideas in chess, and run it against the puzzle database and see their coverage and effectiveness. 

Welcome to GofChess. 

But there is more to it.

Imagine a chess engine that can explain the best lines and why they work. Imagine building your own chess engine using your own ideas expressed cleanly and compositionally — almost like writing mathematics for chess concepts.

That is where the name comes from: GofChess — inspired by G of F like function composition.

But it might take you some time to getting used to the language, although it is very expressive, and flexible, there is a learning curve for non-programmer chess enthusiasts. Also since the early release, there is bugs, and unfriendly errors happening sometimes.

Here's a sneak peak:

```
if attacks_through(queen, knight, bishop)
ve defends(bishop2, knight)
ve captures(bishop, knight_bishop3)
  if exchanges_hanging(bishop2, bishop3_bishop4, queen, queen2)
```

Once you have some time, stop on by at [gofchess.com](https://gofchess.com/), and become a part of the community we hope will grow around these ideas.

PS: You can find a more in-depth technical discussion of the Language in my [upcoming follow-up blog post]().