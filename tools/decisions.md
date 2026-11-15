# Decisions ledger (site counter: data.json `site.decisions`)

Ariana asked (11/15) for an exact, gross count of every decision she has made building the site and working with Claude: no estimates, counted from the chat history and added to gradually.

**What counts as one decision:** each separate instruction, choice or approval in one of her messages (a pick between mockups, "push", a wording change, a size/position change, a rule, a rename, each image she picks). Questions, requests to see something, and thanks do not count.

## Progress
| Source | Turns | Read so far | Decisions counted |
|---|---|---|---|
| Building your own website (2410891c…) | 450 | 0 | 0 |
| DJ mixing software in C++ (ef0cce24…) | 66 | 0 | 0 |
| Rhino 3DM installation (912ce0af…) | 53 | 0 | 0 |
| Claude Code session 99f620c9 (this working chat), from the 11/8 summary through 11/15 12:29 | all | all | 212 (72 from the pre-11/9 messages in the session summary, 140 from 11/9 to 11/15 12:29) |
| **Total** | | | **212** |

Earlier parts of the working chat that were compacted before the 11/8 summary still need counting from the session transcript.

## How to update
- After each working session, count Ariana's decisions in that session, add them here and to `site.decisions`.
- When usage allows, read the next few dozen turns of an old chat (read_conversation with the page token), count, update the table and `site.decisions`.
- Version `site.v` is 1.<number of pushes>; add one with every push.
