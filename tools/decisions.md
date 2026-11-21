# Decisions ledger (site counter: data.json `site.decisions`)

Ariana asked (11/15) for an exact, gross count of every decision she has made building the site and working with Claude: no estimates, counted from the chat history and added to gradually.

**What counts as one decision:** each separate instruction, choice or approval in one of her messages (a pick between mockups, "push", a wording change, a size/position change, a rule, a rename, each image she picks). Questions, requests to see something, and thanks do not count.

## Progress
| Source | Turns | Read so far | Decisions counted |
|---|---|---|---|
| Building your own website (2410891c…) | 450 | 10 (turns 0–9; next page token t10) | 5 |
| DJ mixing software in C++ (ef0cce24…) | 66 | 0 | 0 |
| Rhino 3DM installation (912ce0af…) | 53 | 0 | 0 |
| Claude Code session 99f620c9 (this working chat), from the 11/8 summary through 11/20 17:30 | all | all | 278 (72 from the pre-11/9 messages in the session summary, 140 from 11/9 to 11/15 12:29, 55 from 11/15 12:29 to 11/16 16:51: last card picks and exports, Claudia Sonnek Levy's card, wording passed as is, 02 narrow column, live counter page; 10 more by 18:27: hourglass counter in the card style, decisions.log tab, idle-time counting, push; 1 on 11/20: counter-only updates don't raise the version) |
| **Total** | | | **283** |

The session transcript only keeps messages from 11/15 on, so the part of the working chat before 11/8 cannot be recounted (checked 11/16).

Live counter page (claude.ai artifact, Ariana watches it): https://claude.ai/artifact/Hg467Bmkk7kFrJB1HqWBGM — update its db doc `counter/main` (total, v, sources[{name, turns, read, count, status}], note, updated) with ArtifactData every time this table changes.

Background counting: a send_later in the working chat every ~45 min reads ~40 more turns while Ariana is away (her request 11/16) and pushes only data.json `site` + this ledger (counter data, approved 11/16).

## How to update
- After each working session, count Ariana's decisions in that session, add them here and to `site.decisions`.
- When usage allows, read the next few dozen turns of an old chat (read_conversation with the page token), count, update the table and `site.decisions`.
- Version `site.v` is 1.<number of pushes>; add one with every push.
