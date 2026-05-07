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
1 https://lichess.org/training/0000D
if in_backrank_wall { Rd8 }
ve attack_and_through { Rd8 }
 if evades_attack_non_confrontational { Rd8 Qa3 }..
  if check_king_with_block_no_capture_no_evade { Rd8 Qa3 Rxd1+ }..
   if blocks { Rd8 Qa3 Rxd1+ Ne1 }..
    if checkmate { Rd8 Qa3 Rxd1+ Ne1 Rxe1# }..
 if evades_with_cover_block { Rd8 Qb4 }..
  if captures_hanging { Rd8 Qb4 Qxb4 }.
 if sacrifices_with_exchange { Rd8 Qxd8+ Bxd8 }
```

Once you have some time, stop on by at [gofchess.com](https://gofchess.com/), and become a part of a community we hope will grow around these ideas.

PS: You can find a more in-depth technical discussion of the Language in my [upcoming follow-up blog post](blog2.md).