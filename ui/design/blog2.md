### GofChess — A Technical Dive into Formalization of Chess Tactics

If you haven't read the [Introductory Blog Post for GofChess](blog.md), please do so.

GofChess is a language to express branching nature of chess tactics, using variable unification, and some composable builtin chess related logical primitives, and some nested tree-like structure.


### So What is the Output?

Output is: Some ideas that have matched along with the moves that have matched.

```
'1 https://lichess.org/training/0000D'
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

We can also tag certain lines to be principal variations or best lines, so we know when they match we have a tactic with that principal idea. Not super clear? more on that later.

In the example above, if you check the puzzle given in the link _'at the top comment'_, you can clearly see the moves for the best line has been found by some lines in this tactical description.

### So How does this work?


There are 2 forms. The main form for example this, correctly identifies a certain tactical idea:

```
'1 https://lichess.org/training/0000D'
if in_backrank_wall(king, pawn, pawn2, pawn3)
ve attack_and_through(rook2, rook3, queen, rook4) 
  if evades_attack_non_confrontational(queen, queen2, rook3) 
    if check_king_with_block_no_capture_no_evade(rook3, rook5, king)
      if blocks(knight, $knight2, rook5, king)
        if checkmate(rook5, rook6, king) [cond]
  if evades_with_cover_block(queen, queen3, rook3, $knight2)
    if captures_hanging(queen4, queen3_queen5)
  if sacrifices_with_exchange(queen3, rook3_queen4, bishop, bishop2) [win]
```


The keywords are written in a natural form, and their semantics are described using more primitive builtin blocks; this is the second form, that looks like this:

```
def attacks_through(From, To, Through)
  attack_through(From, To, Through)

def blocks_check_defended_by(From, To, DefendFrom, AttackFrom, AttackTo)
  move(From, To)
  defend(DefendFrom, To)
  attack_through(AttackFrom, AttackTo, To)
```

The variable unification is very similar to Prolog, for example:

`if checkmate(rook5, rook6, king) [cond]`

this description explains: `rook5 moves to rook6 and checkmates the king`.

this is possible because of this definition:

```
def checkmate(From, To, King)
  move(From, To)
  attack(To, King)
  no_king_evades(King)
  no_captures(To)
  no_blocks_check(To, King)
  no_push_blocks_check(To, King)
```

This is like a function definition where `From`, `To`, `King` are parameters that are passed to atomic builtin blocks like `move(From, To)` or `attack(To, King)`.

If you go through it, `move(rook5, rook6)` meaning `rook5` moves to `rook6`, but the trick is `rook5` and `rook6` are also variables for specific squares, such as `rook5` refers to rook on it's original square, `rook6` is the square where the rook moves to! And these variables are immutable of course, otherwise it would be a mess.

To follow-along the description, after rook moves, the move is made on the board, and now we check the next block `attack(rook6, king)`, meaning after the rook moves to `rook6` it is attacking the king, that is a check!

This is the overall idea, and the further along you go, the more intricate and expressive the builtin blocks can get, we can always define a new custom chess logic block upon request, these are the ones I come up with for now. To be comprehensive, following blocks try to express that king has no escapes, the rook cannot be captured, or blocked, such that text book definition of a checkmate is expressed.

Finally there are 2 types of builtin-blocks, action blocks, and filter blocks. Action blocks are making actual moves on the position and pushing the position into a new state, (but unified variables and squares don't change of course), Filter blocks are only testing something against the position and unifying the variables, possibly constraining them to individual squares or range of squares.

For example when you say `bishop` attacks `bishop2`, `bishop2` is constrained—unified to only those squares that `bishop` can attack to.

### Covering Alternative Lines with Nested "if" and "ve" blocks

If you note the first form has a nested "if" and "ve" blocks with indentation. It forms a tree structure, each "if" is replaced with it's definition, and the moves are applied if there are any. But when we move on a sibling line, the applied moves on the children are removed, and the state preserves from the parent. This allows to express the variations—alternative branches in a natural way.

Finally the "ve" clause is just a simple "and" condition as if the 2 bounding lines were applied in sequence following from the same position.

### 2 Killer Extensions to the Variable Unification

Imagine at the end of a description of a tactic your knight blocks a check on a square called `$knight2`. Then if you reuse this same `$knight2` variable on a sibling block, normally it has been reset and doesn't relate to it's previous unification, since a sibling not only resets the position history but also accompanying variables that has been used on it's own branch. But the exception is the `$` prefix, it has to be put on exactly 2 places; somewhere on a branch, and somewhere on a sibling branch, then the earlier unification is preserved when the prefixed variable is reused on the sibling branch.

Let me show you an example:

```
'1 https://lichess.org/training/0000D'
if in_backrank_wall(king, pawn, pawn2, pawn3)
ve attack_and_through(rook2, rook3, queen, rook4) 
  if evades_attack_non_confrontational(queen, queen2, rook3) 
    if check_king_with_block_no_capture_no_evade(rook3, rook5, king)
      if blocks(knight, $knight2, rook5, king)
        if checkmate(rook5, rook6, king)
  if evades_with_cover_block(queen, queen3, rook3, $knight2)
    if captures_hanging(queen4, queen3_queen5) then
  if sacrifices_with_exchange(queen3, rook3_queen4, bishop, bishop2)
```

This is the description script for the output I gave you at the very first section. And if you recall that section especially this line:

`if evades_with_cover_block { Rd8 Qb4 }..` `Qb4` move is made specifically to cover the knight's blocking square for the rook check on the first branch: at this line `if blocks { Rd8 Qa3 Rxd1+ Ne1 }..`. Without this extension, this `Qb4` shot wouldn't be possible.


The second killer feature is the rejection suffix `!`, and it solves a different kind of problem. 
This time it can be used on a very specific position on a branch, such as where a piece moves to. Then when used again with the same `!` suffix on a sibling branch, the earlier unification is rejected and not considered again. This is useful because if we covered a certain move on a previous branch and want to skip that move on the next branch, we can use this symbol.

Let me demonstrate this with another example:

```
if has_eye_king(queen, pawn, king)
ve attacks(rook, rook2, pawn)
  if no_cover(rook3, rook4, pawn)
    if checkmate_with_capture(queen, pawn_queen2, king)
  'if has_no_move_to_cover(queen2, pawn)'
  if hangs_to(queen2, queen3!_knight3, knight)
  if checks(queen2, queen3!, king2)
    if blocks_check_defended_by(knight, knight2, queen, queen3, king2)
      if sacrifices_with_exchange(queen3, knight2_queen4, queen, queen5)
```

and the output looks like this:

```
0 https://lichess.org/training/00008
Solution: Rxe7 Qb1+ Nc1 Qxc1+ Qxc1
if has_eye_king { Rxe7 }
ve attacks { Rxe7 }
 if no_cover { Rxe7 Rb8 }..
  if checkmate_with_capture { Rxe7 Rb8 Qxh7# }..
 if hangs_to { Rxe7 Qa1+ Nxa1 }..
 if checks { Rxe7 Qb1+ }
  if blocks_check_defended_by { Rxe7 Qb1+ Nc1 }
   if sacrifices_with_exchange { Rxe7 Qb1+ Nc1 Qxc1+ Qxc1 }
```

So if you note that, this line `if checks { Rxe7 Qb1+ }` has only a single matching line, (you can tell because it has no dots coming after the line). But Qa1+ or Qc1+ was also possible, but they got rejected because they were covered earlier by this line: 

```if hangs_to(queen2, queen3!_knight3, knight)```

note the `queen3!` and exclamation suffix, it is possible to skip already covered moves!


And please remember you have to reuse the exclamation suffix, in the sibling branch, where you want to skip the moves:

```if checks(queen2, queen3!, king2)```
.

### Witness Lines — Is this supposed to clarify a proof for a certain tactical idea exists?

Honest answer: We are not sure. We don't know how strong or useful this language is, we haven't proven anything with it so far. But let me give you 2 more additional extensions, that at least showcases the flexibility or the range of expressions of the potential:


Tagging system that looks like this, taken from earlier examples mentioned above:

```if checkmate(rook5, rook6, king) [cond]```

```if sacrifices_with_exchange(queen3, rook3_queen4, bishop, bishop2) [win]```

Note the `[cond]` and `[win]` tags. `cond` tag means, in order for the solution of the puzzle to match, this branch has to be matched at least 1 times. `win` tag means, This branch of the puzzle has to be matched exactly 1 times and it describes the absolute best line for this tactical idea.

And we are done, we can't get any more expressive than that. So far of course...

### How to use the Language on gofchess.com — Test Your Ideas against a Puzzle Database?

Gofchess.com is a domain we bought for monetization purposes, but honestly it's a small tech demo, with an super early release version. So beware of getting stuck and things not making sense. But we are dedicated to provide support and maintenance to this project, personally and hopefully profesionally in the future ahead of us. 

There is also a README on the [github repository of gofchess.com website](https://github.com/eguneys/gofchess-26) on instructions on how to use the website. So Please make sure to check it out and leave a star if you will.

### Contributing — Getting even deeper!

There is a private repository for the engine that runs the language optimized for performance currently being written in C++ which we hopefully plan to release in the future. 
There is also a [main repository](https://github.com/eguneys/hopefox) that runs the language, written in Typescript. We have put out a README if you want to get more advanced. It has some tests and you can experiment the language through the test runner, that reads from a script file and writes back to an output file, which you can put side by side, and iterate in a live reloading fashion. So Please don't forget to give that a star as well.


We've been circling around similar ideas for years, to come up with this idea we are still in the process of shaping. As Roman Dzindzichashvili once said in one of his DVD's and I remember, 

> We don't know we are going to win, but we have to believe, and make the next best move.