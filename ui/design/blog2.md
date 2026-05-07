### GofChess — A Technical Dive into Formalization of Chess Tactics

If you haven't read the [Introductory Blog Post for GofChess](blog.md), please do so.

GofChess is a language to express branching nature of chess tactics, using variable unification, and some composable builtin chess related logical primitives, and some nested tree-like structure.


### So What is the Output?

Output is: Some ideas that have matched along with the moves that have matched.

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

We can also tag certain lines to be principal variations or best lines, so we know when they match we have a tactic with that principal idea. Not super clear? more on that later.

In the example above, if you check the puzzle given in the link <small>at the top comment</small>, you can clearly see the moves for the best line has been found by some lines in this tactical description.

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

Finally there are 2 types of builtin-blocks, action blocks, and filter blocks. Action blocks are making actual moves on the position and pushing the position into a new state, (but variables and squares don't change of course), Filter blocks are only testing something against the position and unifying the variables, possibly constraining them to individual squares or range of squares.

For example when you say `bishop` attacks `bishop2`, `bishop2` is constrained—unified to only those squares that `bishop` can attack to.

### Covering Alternative Lines with Nested "if" and "ve" blocks

If you note the first form has a nested "if" and "ve" blocks with indentation. It forms a tree structure, each "if" is replaced with it's definition, and the moves are applied if there are any. But when we move on a sibling line, the applied moves on the children are removed, and the state preserves from the parent. This allows to express the variations—alternative branches in a natural way.

Finally the "ve" clause is just a simple "and" condition as if the 2 bounding lines were applied in sequence following from the same position.

### 2 Killer Extensions to the Variable Expressions


### Witness Lines — Is this supposed to find a proof for a certain tactical idea exists?

### How to use the Language on gofchess.com, and Test Your Ideas against a Puzzle Database?

