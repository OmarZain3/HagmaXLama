# هجمة ولمة – HagmaXLama Fantasy

Fantasy football web app (mobile-first): React + TypeScript + Tailwind, backend on Google Apps Script + Google Sheets.

## Stack

- **Frontend:** React (Vite), TypeScript (strict), TailwindCSS
- **Backend:** Google Apps Script (single `POST` endpoint)
- **Database:** Google Sheets
- **Hosting:** Replit (or any static host)

## Setup

### 1. Frontend

```bash
npm install
cp .env.example .env
# Edit .env and set VITE_API_URL to your Google Apps Script Web App URL
# Optionally set VITE_ADMIN_NAMES (comma-separated) for users who can access the Admin panel
npm run dev
```

**Admin:** Set `VITE_ADMIN_NAMES=Admin,OtherName` in `.env`. Only those user **names** (as stored in the Users sheet) can see the Admin link and open `/admin`. Non-admins are redirected to the dashboard if they try to open `/admin`.

### 2. Google Sheets

Create a spreadsheet with these sheets and **exact headers**:

**Players**  
`ID | Name | IsGK | Team | ImageURL | TotalPoints | Day1 | Day2 | Day3 | QF | SF | Final`

**Users**  
`UserID | Name | TeamName | Password | CaptainID | PlayerIDs | Subs | TransfersUsed`  
(PlayerIDs and Subs store JSON arrays of player IDs, e.g. `["id1","id2"]`)

**Rounds**  
`Round | Active | MaxTransfers | MaxPerTeam | AllowSubs | TransferWindow | MatchInPlay`  
One data row: e.g. `1 | FALSE | 2 | 3 | TRUE | FALSE | FALSE`

**Points**  
`Round | PlayerID | Goals | Assists | CleanSheet | YC | 2YC | RC | PenSave | PenGoal | PenMiss | OwnGoal | Conceded`

**Leaderboard**  
`UserID | Name | TeamName | TotalPoints | Day1 | Day2 | Day3 | QF | SF | Final`  
(Can be empty; updated via Admin “تحديث الترتيب”.)

**TransferHistory**  
`UserID | Round | OutPlayerID | InPlayerID | Timestamp`

**TeamHistory** (optional)  
`UserID | Round | CaptainID | PlayerIDs | Subs | Timestamp`

### 3. Google Apps Script Backend

1. In the same Google Sheet: **Extensions → Apps Script**.
2. Replace default `Code.gs` with the contents of `backend/Code.gs`.
3. **Deploy → New deployment → Web app**: Execute as “Me”, Who has access “Anyone”.
4. Copy the Web App URL into `.env` as `VITE_API_URL`.

## Brand Colors

- Primary Blue: `#083F5E`
- Card Orange: `#F79C22`
- Primary Gold: `#EECC4E`
- Light Cream: `#F8ECA7`
- Danger Red: `#A71F26`
- Accent Sky Blue: `#99BFDE`  
Font: Poppins.

## Rules (enforced server-side)

- 5 main + 2 subs; exactly 1 GK in main, max 1 GK in subs.
- Max 3 players from same real team.
- Captain from main 5 only; captain points × 2.
- Subs do not earn points.
- No transfers/subs/captain change when `MatchInPlay = true`.
- Transfers only when `TransferWindow = true`, max 2 total (between QF and Semi).
- No transferring or subbing captain; no duplicate players.

Scoring is calculated only in the backend (see `adminUpdateStats` and scoring rules in spec).

## Scripts

- `npm run dev` – development
- `npm run build` – production build
- `npm run preview` – preview production build
