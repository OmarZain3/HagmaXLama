/**
 * HagmaXLama Fantasy – Google Apps Script Backend
 * Deploy as Web App: Execute as "Me", Who has access: "Anyone".
 * Fantasy Premier League Style Game - Backend API
 */

// ============= CONFIGURATION =============
const SHEETS = {
  PLAYERS: 'Players',
  USERS: 'Users',
  ROUNDS: 'Rounds',
  POINTS: 'Points',
  LEADERBOARD: 'Leaderboard',
  TRANSFER_HISTORY: 'TransferHistory',
  TEAM_HISTORY: 'TeamHistory',
};

const MAX_MAIN = 5;
const MAX_SUBS = 2;
const MAX_SAME_TEAM = 3;
const MAX_TRANSFERS = 2;
const ROUND_COLS = ['Day1', 'Day2', 'Day3', 'QF', 'SF', 'Final'];

// ============= MAIN ENDPOINTS =============

// ============= MAIN ENDPOINTS =============

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action) : 'health';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (!ss) {
      return jsonResponse({ success: false, error: 'ERROR: Google Apps Script is not bound to a spreadsheet.' });
    }
    
    ensureAllSheets(ss);
    
    if (action === 'health') {
      return jsonResponse({ success: true, data: { ok: true, time: new Date().toISOString() } });
    }
    if (action === 'testPlayers') {
      // Force seed and return count
      const playersSh = getSheet(ss, SHEETS.PLAYERS);
      let data = playersSh.getDataRange().getValues();
      if (data.length < 2) {
        seedSamplePlayers(ss);
        data = playersSh.getDataRange().getValues();
      }
      return jsonResponse({ success: true, data: { 
        playerCount: data.length - 1, 
        headers: data[0],
        sampleRow: data.length > 1 ? data[1] : null
      }});
    }
    if (action === 'diagnosticInfo') { 
      return jsonResponse({ success: true, data: getDiagnosticInfo(ss) });
    }
    if (action === 'viewAllPlayers') {
      return jsonResponse({ success: true, data: viewAllPlayers(ss) });
    }
    if (action === 'viewLeaderboard') {
      return jsonResponse({ success: true, data: viewLeaderboard(ss) });
    }
    return jsonResponse({ success: false, error: 'Unknown GET action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message || String(err) });
  }
}

function doPost(e) {
  const out = { success: false, error: '', data: null, message: '' };
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      out.error = 'ERROR: Google Apps Script is not bound to a spreadsheet.';
      return jsonResponse(out);
    }
    
    // Initialize all sheets first
    ensureAllSheets(ss);
    
    // Parse request body
    let body = {};
    try {
      if (e && e.postData && e.postData.contents) {
        body = JSON.parse(e.postData.contents);
      }
    } catch (parseErr) {
      out.error = 'Invalid JSON in request: ' + parseErr.message;
      return jsonResponse(out);
    }
    
    const action = body.action;
    if (!action) {
      out.error = 'Missing action';
      return jsonResponse(out);
    }
    
    switch (action) {
      case 'registerUser':
        out.data = registerUser(ss, body);
        out.success = true;
        break;
      case 'loginUser': {
        const loginResult = loginUser(ss, body);
        if (loginResult && loginResult.UserID) {
          out.data = loginResult;
          out.success = true;
        } else {
          out.success = false;
          out.error = (loginResult && loginResult.error) ? loginResult.error : 'Invalid name or password';
        }
        break;
      }
      case 'loginDebug': {
        // Debug endpoint to show what's in the users sheet
        const usersSh = getSheet(ss, SHEETS.USERS);
        const usersData = usersSh.getDataRange().getValues();
        const dbName = usersData.length > 1 && usersData[1][1] ? String(usersData[1][1]).trim() : '(no users)';
        const dbPass = usersData.length > 1 && usersData[1][3] ? String(usersData[1][3]).trim() : '(no users)';
        out.data = {
          attemptedName: (body.name || '').trim(),
          attemptedPassword: (body.password || '').trim(),
          firstUserInDB: { name: dbName, password: dbPass },
          totalUsersInDB: Math.max(0, usersData.length - 1),
          allUsers: usersData.slice(1).map(r => ({ name: r[1], password: r[3] })),
          message: 'Debug info - check if your name/password matches'
        };
        out.success = true;
        break;
      }
      case 'addPlayerToTeam':
        out.message = addPlayerToTeam(ss, body);
        out.success = true;
        break;
      case 'selectCaptain':
        out.message = selectCaptain(ss, body);
        out.success = true;
        break;
      case 'substitutePlayer':
        out.message = substitutePlayer(ss, body);
        out.success = true;
        break;
      case 'transferPlayer':
        out.message = transferPlayer(ss, body);
        out.success = true;
        break;
      case 'viewMyPlayers':
        out.data = viewMyPlayers(ss, body);
        out.success = true;
        break;
      case 'viewAllPlayers':
        out.data = viewAllPlayers(ss);
        out.success = true;
        break;
      case 'viewLeaderboard':
        out.data = viewLeaderboard(ss);
        out.success = true;
        break;
      case 'getRoundState':
        out.data = getRoundState(ss);
        out.success = true;
        break;
      case 'adminUpdateStats':
        out.message = adminUpdateStats(ss, body);
        out.success = true;
        break;
      case 'adminImportPlayers':
        out.data = adminImportPlayers(ss, body);
        out.success = true;
        break;
      case 'updateLeaderboard':
        out.message = updateLeaderboard(ss);
        out.success = true;
        break;
      case 'toggleRoundState':
        out.message = toggleRoundState(ss, body);
        out.success = true;
        break;
      case 'diagnosticInfo':
        out.data = getDiagnosticInfo(ss);
        out.success = true;
        break;
      default:
        out.error = 'Unknown action: ' + action;
    }
  } catch (err) {
    out.error = err.message || String(err);
  }
  
  return jsonResponse(out);
}

// ============= UTILITY FUNCTIONS =============

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
  }
  return sh;
}

function ensureAllSheets(ss) {
  // Initialize Users sheet - NEVER clear if rows exist
  let usersSheet = getSheet(ss, SHEETS.USERS);
  let usersData = usersSheet.getDataRange().getValues();
  let usersHeader = ['UserID', 'Name', 'TeamName', 'Password', 'CaptainID', 'PlayerIDs', 'Subs', 'TransfersUsed'];
  if (usersData.length === 0) {
    // Completely empty sheet - add headers
    usersSheet.getRange(1, 1, 1, usersHeader.length).setValues([usersHeader]);
  } else if (String(usersData[0][0]).trim() !== 'UserID') {
    // Has data but header is wrong - only fix if no user data exists
    if (usersData.length <= 1) {
      usersSheet.getRange(1, 1, 1, usersHeader.length).setValues([usersHeader]);
    }
    // If users exist, DON'T touch the sheet - avoid data loss
  }
  
  // Initialize Players sheet
  let playersSheet = getSheet(ss, SHEETS.PLAYERS);
  let playersData = playersSheet.getDataRange().getValues();
  let playersHeader = ['ID', 'Name', 'IsGK', 'Team', 'ImageURL', 'TotalPoints', 'Day1', 'Day2', 'Day3', 'QF', 'SF', 'Final'];
  
  if (playersData.length === 0) {
    // Completely empty - create headers only
    playersSheet.getRange(1, 1, 1, playersHeader.length).setValues([playersHeader]);
  } else if (playersData.length > 0 && String(playersData[0][0]) !== 'ID') {
    // Headers are wrong - fix them
    playersSheet.getRange(1, 1, 1, playersHeader.length).setValues([playersHeader]);
  } else if (playersData[0].length < playersHeader.length) {
    // User has data but missing scoring columns - add them
    const currentHeaders = playersData[0];
    const missingCols = playersHeader.slice(currentHeaders.length);
    for (let col = currentHeaders.length + 1; col <= playersHeader.length; col++) {
      playersSheet.getRange(1, col).setValue(playersHeader[col - 1]);
      // Fill all rows in new columns with 0
      for (let row = 2; row <= playersData.length; row++) {
        playersSheet.getRange(row, col).setValue(0);
      }
    }
  }
  
  // Only seed sample players if completely empty (no players at all)
  playersData = playersSheet.getDataRange().getValues();
  if (playersData.length < 2) {
    seedSamplePlayers(ss);
  }
  
  // Initialize Rounds sheet
  let roundsSheet = getSheet(ss, SHEETS.ROUNDS);
  let roundsData = roundsSheet.getDataRange().getValues();
  let roundsHeader = ['Round', 'Active', 'MatchInPlay', 'TransferWindow', 'AllowSubs'];
  if (roundsData.length === 0 || String(roundsData[0][0]) !== 'Round') {
    roundsSheet.clear();
    roundsSheet.getRange(1, 1, 1, roundsHeader.length).setValues([roundsHeader]);
    roundsSheet.appendRow([1, true, false, true, true]);
  }
  
  // Initialize Leaderboard sheet
  let leaderboardSheet = getSheet(ss, SHEETS.LEADERBOARD);
  let leaderboardData = leaderboardSheet.getDataRange().getValues();
  let leaderboardHeader = ['UserID', 'Name', 'TeamName', 'TotalPoints', 'Day1', 'Day2', 'Day3', 'QF', 'SF', 'Final'];
  if (leaderboardData.length === 0 || String(leaderboardData[0][0]) !== 'UserID') {
    leaderboardSheet.clear();
    leaderboardSheet.getRange(1, 1, 1, leaderboardHeader.length).setValues([leaderboardHeader]);
  }
  
  // Initialize Points sheet
  let pointsSheet = getSheet(ss, SHEETS.POINTS);
  let pointsData = pointsSheet.getDataRange().getValues();
  let pointsHeader = ['Round', 'PlayerID', 'Goals', 'Assists', 'CleanSheet', 'YC', 'SecondYC', 'RC', 'PenSave', 'PenGoal', 'PenMiss', 'OwnGoal', 'Conceded'];
  if (pointsData.length === 0 || String(pointsData[0][0]) !== 'Round') {
    pointsSheet.clear();
    pointsSheet.getRange(1, 1, 1, pointsHeader.length).setValues([pointsHeader]);
  }
  
  // Initialize TransferHistory sheet
  let transferSheet = getSheet(ss, SHEETS.TRANSFER_HISTORY);
  let transferData = transferSheet.getDataRange().getValues();
  let transferHeader = ['UserID', 'Round', 'OutPlayerID', 'InPlayerID', 'Timestamp'];
  if (transferData.length === 0 || String(transferData[0][0]) !== 'UserID') {
    transferSheet.clear();
    transferSheet.getRange(1, 1, 1, transferHeader.length).setValues([transferHeader]);
  }
}

// ============= HELPER FUNCTIONS =============

function getPlayerById(ss, playerId) {
  const playersSh = getSheet(ss, SHEETS.PLAYERS);
  const data = playersSh.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('ID');
  
  if (idCol < 0) return null;
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(playerId)) {
      return rowToObj(headers, data[i]);
    }
  }
  return null;
}

function getAllPlayers(ss) {
  const playersSh = getSheet(ss, SHEETS.PLAYERS);
  const data = playersSh.getDataRange().getValues();
  if (data.length < 2) return [];
  
  const headers = data[0];
  const players = [];
  for (let i = 1; i < data.length; i++) {
    players.push(rowToObj(headers, data[i]));
  }
  return players;
}

function rowToObj(headers, row) {
  const obj = {};
  headers.forEach((key, i) => { obj[key] = row[i]; });
  return obj;
}

function findUserByUserId(ss, userId) {
  const usersSh = getSheet(ss, SHEETS.USERS);
  const data = usersSh.getDataRange().getValues();
  const headers = data[0];
  const col = headers.indexOf('UserID');
  
  if (col < 0) return null;
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][col]) === String(userId)) {
      return { rowIndex: i + 1, data: rowToObj(headers, data[i]) };
    }
  }
  return null;
}

function getRoundState(ss) {
  const roundsSh = getSheet(ss, SHEETS.ROUNDS);
  const data = roundsSh.getDataRange().getValues();
  
  if (data.length < 2) {
    return { 
      ActiveRound: 1, 
      TransferWindow: false, 
      AllowSubs: false, 
      MatchInPlay: false 
    };
  }
  
  const headers = data[0];
  const row = data[1];
  
  const getIndex = (key) => {
    const i = headers.indexOf(key);
    return i >= 0 ? row[i] : null;
  };
  
  return {
    ActiveRound: Number(getIndex('Round') || getIndex('Active') || 1) || 1,
    TransferWindow: getIndex('TransferWindow') === true || getIndex('TransferWindow') === 'TRUE',
    AllowSubs: getIndex('AllowSubs') === true || getIndex('AllowSubs') === 'TRUE',
    MatchInPlay: getIndex('MatchInPlay') === true || getIndex('MatchInPlay') === 'TRUE',
  };
}

function normalizePlayer(p) {
  if (!p) return null;
  return {
    ID: String(p.ID || ''),
    Name: p.Name || '',
    IsGK: p.IsGK === true || p.IsGK === 'TRUE' || p.IsGK === 1,
    Team: p.Team || '',
    ImageURL: p.ImageURL || '',
    TotalPoints: Number(p.TotalPoints) || 0,
    Day1: Number(p.Day1) || 0,
    Day2: Number(p.Day2) || 0,
    Day3: Number(p.Day3) || 0,
    QF: Number(p.QF) || 0,
    SF: Number(p.SF) || 0,
    Final: Number(p.Final) || 0,
  };
}

// ============= AUTHENTICATION =============

function registerUser(ss, body) {
  const name = (body.name || '').trim();
  const teamName = (body.teamName || '').trim();
  const password = (body.password || '').trim();
  
  if (!name || !teamName || !password) {
    throw new Error('Missing name, teamName, or password');
  }
  
  const usersSh = getSheet(ss, SHEETS.USERS);
  const data = usersSh.getDataRange().getValues();
  const headers = data[0];
  const nameCol = headers.indexOf('Name');
  const teamCol = headers.indexOf('TeamName');
  
  // Check for duplicate name or team
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][nameCol]).trim().toLowerCase() === name.toLowerCase()) {
      throw new Error('User name already exists');
    }
    if (String(data[i][teamCol]).trim().toLowerCase() === teamName.toLowerCase()) {
      throw new Error('Team name already exists');
    }
  }
  
  // Create new user
  const userId = 'U' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  usersSh.appendRow([userId, name, teamName, password, '', '[]', '[]', 0]);
  
  return { UserID: userId, Name: name, TeamName: teamName };
}

function loginUser(ss, body) {
  const name = (body.name || '').trim();
  const password = (body.password || '').trim();
  
  if (!name || !password) {
    return { error: 'Name and password are required' };
  }
  
  const usersSh = getSheet(ss, SHEETS.USERS);
  const data = usersSh.getDataRange().getValues();
  
  if (data.length < 2) {
    return { error: 'No users registered yet. Please sign up first.' };
  }
  
  // Always use fixed column positions (0=UserID, 1=Name, 2=TeamName, 3=Password)
  // This is resilient to header name issues like leading spaces
  const USER_ID_COL = 0;
  const NAME_COL = 1;
  const TEAM_COL = 2;
  const PASS_COL = 3;
  
  let foundName = false;
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[USER_ID_COL]) continue; // skip empty rows
    const rowName = String(row[NAME_COL] || '').trim();
    const rowPassword = String(row[PASS_COL] || '').trim();
    
    if (rowName.toLowerCase() === name.toLowerCase()) {
      foundName = true;
      if (rowPassword === password) {
        return {
          UserID: String(row[USER_ID_COL]).trim(),
          Name: rowName,
          TeamName: String(row[TEAM_COL]).trim()
        };
      }
    }
  }
  
  if (foundName) {
    return { error: 'Wrong password. Try again.' };
  }
  return { error: 'Name not found. Check spelling or sign up first.' };
}

// ============= TEAM MANAGEMENT =============

function addPlayerToTeam(ss, body) {
  const userId = body.userId;
  const playerId = String(body.playerId || '');
  
  if (!userId || !playerId) {
    throw new Error('Missing userId or playerId');
  }
  
  const user = findUserByUserId(ss, userId);
  if (!user) throw new Error('User not found');
  
  let players = [];
  try { 
    players = JSON.parse(user.data.PlayerIDs || '[]'); 
  } catch (e) { 
    players = []; 
  }
  
  let subs = [];
  try { 
    subs = JSON.parse(user.data.Subs || '[]'); 
  } catch (e) { 
    subs = []; 
  }
  
  if (players.indexOf(playerId) >= 0 || subs.indexOf(playerId) >= 0) {
    throw new Error('Player already in team');
  }
  
  const player = getPlayerById(ss, playerId);
  if (!player) throw new Error('Player not found');
  
  const roundState = getRoundState(ss);
  if (roundState.MatchInPlay) {
    throw new Error('Match in play – cannot add players');
  }
  
  if (players.length >= MAX_MAIN && subs.length >= MAX_SUBS) {
    throw new Error('Team is full (5 main + 2 subs)');
  }
  
  // Check team constraints
  const isGK = player.IsGK === true || player.IsGK === 'TRUE' || player.IsGK === 1;
  
  if (players.length < MAX_MAIN) {
    let gkCount = 0;
    players.forEach(id => {
      const p = getPlayerById(ss, id);
      if (p && (p.IsGK === true || p.IsGK === 'TRUE' || p.IsGK === 1)) gkCount++;
    });
    
    if (isGK && gkCount >= 1) {
      throw new Error('Maximum 1 GK allowed in main team');
    }
    
    players.push(playerId);
  } else {
    let subGkCount = 0;
    subs.forEach(id => {
      const p = getPlayerById(ss, id);
      if (p && (p.IsGK === true || p.IsGK === 'TRUE' || p.IsGK === 1)) subGkCount++;
    });
    
    if (isGK && subGkCount >= 1) {
      throw new Error('Maximum 1 GK allowed in substitutes');
    }
    
    subs.push(playerId);
  }
  
  // Check team count constraint
  const allPlayers = players.concat(subs);
  const teamCount = {};
  allPlayers.forEach(id => {
    const p = getPlayerById(ss, id);
    if (p) teamCount[p.Team] = (teamCount[p.Team] || 0) + 1;
  });
  
  for (const team in teamCount) {
    if (teamCount[team] > MAX_SAME_TEAM) {
      throw new Error('Maximum 3 players from same team allowed');
    }
  }
  
  const usersSh = getSheet(ss, SHEETS.USERS);
  usersSh.getRange(user.rowIndex, 6).setValue(JSON.stringify(players));
  usersSh.getRange(user.rowIndex, 7).setValue(JSON.stringify(subs));
  
  return 'Player added successfully';
}

function selectCaptain(ss, body) {
  const userId = body.userId;
  const captainId = String(body.captainId || '');
  
  if (!userId || !captainId) {
    throw new Error('Missing userId or captainId');
  }
  
  const user = findUserByUserId(ss, userId);
  if (!user) throw new Error('User not found');
  
  let players = [];
  try { 
    players = JSON.parse(user.data.PlayerIDs || '[]'); 
  } catch (e) { 
    players = []; 
  }
  
  if (players.indexOf(captainId) < 0) {
    throw new Error('Captain must be from main 5 players');
  }
  
  const roundState = getRoundState(ss);
  if (roundState.MatchInPlay) {
    throw new Error('Match in play – cannot change captain');
  }
  
  const usersSh = getSheet(ss, SHEETS.USERS);
  const headers = usersSh.getRange(1, 1, 1, 10).getValues()[0];
  let capCol = 5;
  
  for (let i = 0; i < headers.length; i++) {
    if (headers[i] === 'CaptainID') {
      capCol = i + 1;
      break;
    }
  }
  
  usersSh.getRange(user.rowIndex, capCol).setValue(captainId);
  return 'Captain selected';
}

function substitutePlayer(ss, body) {
  const userId = body.userId;
  const outPlayerId = String(body.outPlayerId || '');
  const inPlayerId = String(body.inPlayerId || '');
  
  if (!userId || !outPlayerId || !inPlayerId) {
    throw new Error('Missing userId, outPlayerId, or inPlayerId');
  }
  
  const user = findUserByUserId(ss, userId);
  if (!user) throw new Error('User not found');
  
  const roundState = getRoundState(ss);
  if (roundState.MatchInPlay) {
    throw new Error('Match in play – cannot substitute');
  }
  if (!roundState.AllowSubs) {
    throw new Error('Substitutions not allowed in this round');
  }
  
  let players = [];
  try { 
    players = JSON.parse(user.data.PlayerIDs || '[]'); 
  } catch (e) { 
    players = []; 
  }
  
  let subs = [];
  try { 
    subs = JSON.parse(user.data.Subs || '[]'); 
  } catch (e) { 
    subs = []; 
  }
  
  const captainId = user.data.CaptainID || '';
  
  if (outPlayerId === captainId) {
    throw new Error('Cannot substitute captain');
  }
  
  const outInMain = players.indexOf(outPlayerId) >= 0;
  const inInSubs = subs.indexOf(inPlayerId) >= 0;
  
  if (!outInMain || !inInSubs) {
    throw new Error('Out player must be in main team, In player must be in subs');
  }
  
  const inPlayer = getPlayerById(ss, inPlayerId);
  if (!inPlayer) throw new Error('In player not found');
  
  // Update teams
  const newPlayers = players.map(id => id === outPlayerId ? inPlayerId : id);
  const newSubs = subs.filter(id => id !== inPlayerId);
  newSubs.push(outPlayerId);
  
  const usersSh = getSheet(ss, SHEETS.USERS);
  usersSh.getRange(user.rowIndex, 6).setValue(JSON.stringify(newPlayers));
  usersSh.getRange(user.rowIndex, 7).setValue(JSON.stringify(newSubs));
  
  return 'Substitution completed';
}

function transferPlayer(ss, body) {
  const userId = body.userId;
  const outPlayerId = String(body.outPlayerId || '');
  const inPlayerId = String(body.inPlayerId || '');
  
  if (!userId || !outPlayerId || !inPlayerId) {
    throw new Error('Missing userId, outPlayerId, or inPlayerId');
  }
  
  const user = findUserByUserId(ss, userId);
  if (!user) throw new Error('User not found');
  
  const roundState = getRoundState(ss);
  if (roundState.MatchInPlay) {
    throw new Error('Match in play – cannot transfer');
  }
  if (!roundState.TransferWindow) {
    throw new Error('Transfer window is closed');
  }
  
  const transfersUsed = parseInt(user.data.TransfersUsed || '0', 10);
  if (transfersUsed >= MAX_TRANSFERS) {
    throw new Error('Maximum 2 transfers per season used');
  }
  
  let players = [];
  try { 
    players = JSON.parse(user.data.PlayerIDs || '[]'); 
  } catch (e) { 
    players = []; 
  }
  
  let subs = [];
  try { 
    subs = JSON.parse(user.data.Subs || '[]'); 
  } catch (e) { 
    subs = []; 
  }
  
  const captainId = user.data.CaptainID || '';
  
  if (outPlayerId === captainId) {
    throw new Error('Cannot transfer captain');
  }
  
  if (players.indexOf(outPlayerId) < 0) {
    throw new Error('Out player not in main team');
  }
  
  if (players.indexOf(inPlayerId) >= 0 || subs.indexOf(inPlayerId) >= 0) {
    throw new Error('In player already in team');
  }
  
  const inPlayer = getPlayerById(ss, inPlayerId);
  if (!inPlayer) throw new Error('In player not found');
  
  // Update team
  const newPlayers = players.map(id => id === outPlayerId ? inPlayerId : id);
  
  const usersSh = getSheet(ss, SHEETS.USERS);
  usersSh.getRange(user.rowIndex, 6).setValue(JSON.stringify(newPlayers));
  usersSh.getRange(user.rowIndex, 8).setValue(transfersUsed + 1);
  
  // Log transfer
  try {
    const transferSh = getSheet(ss, SHEETS.TRANSFER_HISTORY);
    transferSh.appendRow([userId, roundState.ActiveRound, outPlayerId, inPlayerId, new Date()]);
  } catch (e) {}
  
  return 'Transfer completed';
}

// ============= VIEWS =============

function viewMyPlayers(ss, body) {
  const userId = body.userId;
  if (!userId) throw new Error('Missing userId');
  
  const user = findUserByUserId(ss, userId);
  if (!user) throw new Error('User not found');
  
  let players = [];
  try { 
    players = JSON.parse(user.data.PlayerIDs || '[]'); 
  } catch (e) { 
    players = []; 
  }
  
  let subs = [];
  try { 
    subs = JSON.parse(user.data.Subs || '[]'); 
  } catch (e) { 
    subs = []; 
  }
  
  const mainPlayers = players.map(id => {
    const p = getPlayerById(ss, id);
    return normalizePlayer(p);
  }).filter(p => !!p);
  
  const subPlayers = subs.map(id => {
    const p = getPlayerById(ss, id);
    return normalizePlayer(p);
  }).filter(p => !!p);
  
  return {
    teamName: user.data.TeamName,
    captainId: user.data.CaptainID || '',
    players: mainPlayers,
    subs: subPlayers,
    transfersUsed: user.data.TransfersUsed || 0
  };
}

function viewAllPlayers(ss, body) {
  const playersSh = getSheet(ss, SHEETS.PLAYERS);
  const data = playersSh.getDataRange().getValues();
  
  if (data.length < 2) {
    return { players: [] };
  }
  
  const headers = data[0];
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue; // Skip empty rows
    const obj = rowToObj(headers, row);
    const normalized = normalizePlayer(obj);
    if (normalized && String(normalized.ID).trim()) {
      result.push(normalized);
    }
  }
  
  return { players: result };
}

function viewLeaderboard(ss, body) {
  const leaderboardSh = getSheet(ss, SHEETS.LEADERBOARD);
  const data = leaderboardSh.getDataRange().getValues();
  
  if (data.length < 2) return { leaderboard: [] };
  
  const headers = data[0];
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = rowToObj(headers, row);
    result.push({
      UserID: obj.UserID,
      Name: obj.Name,
      TeamName: obj.TeamName,
      TotalPoints: parseInt(obj.TotalPoints || '0', 10),
      Day1: parseInt(obj.Day1 || '0', 10),
      Day2: parseInt(obj.Day2 || '0', 10),
      Day3: parseInt(obj.Day3 || '0', 10),
      QF: parseInt(obj.QF || '0', 10),
      SF: parseInt(obj.SF || '0', 10),
      Final: parseInt(obj.Final || '0', 10)
    });
  }
  
  // Sort by total points descending
  result.sort((a, b) => b.TotalPoints - a.TotalPoints);
  
  return { leaderboard: result };
}

// ============= ADMIN =============

function seedSamplePlayers(ss) {
  const playersSh = getSheet(ss, SHEETS.PLAYERS);
  const data = playersSh.getDataRange().getValues();
  
  // Only seed if sheet is empty (just headers, no actual players)
  if (data.length < 2) {
    const samplePlayers = [
      ['P1', 'Harry Kane', false, 'England', '', 0, 0, 0, 0, 0, 0, 0],
      ['P2', 'Erling Haaland', false, 'Norway', '', 0, 0, 0, 0, 0, 0, 0],
      ['P3', 'Kylian Mbappé', false, 'France', '', 0, 0, 0, 0, 0, 0, 0],
      ['P4', 'Manuel Neuer', true, 'Germany', '', 0, 0, 0, 0, 0, 0, 0],
      ['P5', 'Ederson', true, 'Brazil', '', 0, 0, 0, 0, 0, 0, 0],
      ['P6', 'Virgil van Dijk', false, 'Netherlands', '', 0, 0, 0, 0, 0, 0, 0],
      ['P7', 'Rúben Dias', false, 'Portugal', '', 0, 0, 0, 0, 0, 0, 0],
      ['P8', 'Trent Alexander-Arnold', false, 'England', '', 0, 0, 0, 0, 0, 0, 0],
      ['P9', 'Gigio Donnarumma', true, 'Italy', '', 0, 0, 0, 0, 0, 0, 0],
      ['P10', 'Kevin De Bruyne', false, 'Belgium', '', 0, 0, 0, 0, 0, 0, 0],
      ['P11', 'Vinícius Jr', false, 'Brazil', '', 0, 0, 0, 0, 0, 0, 0],
      ['P12', 'Jude Bellingham', false, 'England', '', 0, 0, 0, 0, 0, 0, 0],
      ['P13', 'Gianluigi Buffon', true, 'Italy', '', 0, 0, 0, 0, 0, 0, 0],
      ['P14', 'Cristiano Ronaldo', false, 'Portugal', '', 0, 0, 0, 0, 0, 0, 0],
      ['P15', 'Lionel Messi', false, 'Argentina', '', 0, 0, 0, 0, 0, 0, 0],
    ];
    
    samplePlayers.forEach(player => {
      playersSh.appendRow(player);
    });
  }
  // If players already exist, don't overwrite them
}

function adminImportPlayers(ss, body) {
  const sourceSheetName = body.sourceSheetName || 'Team Roster Source';
  
  try {
    const sourceSh = ss.getSheetByName(sourceSheetName);
    const data = sourceSh.getDataRange().getValues();
    
    if (data.length < 2) throw new Error('Source sheet is empty');
    
    const playersSh = getSheet(ss, SHEETS.PLAYERS);
    const nextId = 1000 + Math.floor(Math.random() * 10000);
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const teamName = String(row[0] || '').trim();
      const p1Name = String(row[1] || '').trim();
      const p1Photo = String(row[2] || '').trim();
      
      if (!teamName || !p1Name) continue;
      
      const playerId = String(10000 + i);
      playersSh.appendRow([
        playerId,
        p1Name,
        false,
        teamName,
        p1Photo,
        0,
        0, 0, 0, 0, 0, 0
      ]);
      
      // Import P2-P8 if present
      for (let j = 1; j < 8; j++) {
        const nameCol = j * 2 + 1;
        const photoCol = j * 2 + 2;
        
        if (nameCol <= row.length && photoCol <= row.length) {
          const pName = String(row[nameCol] || '').trim();
          const pPhoto = String(row[photoCol] || '').trim();
          
          if (pName) {
            playersSh.appendRow([
              String(parseInt(playerId, 10) + j),
              pName,
              false,
              teamName,
              pPhoto,
              0,
              0, 0, 0, 0, 0, 0
            ]);
          }
        }
      }
    }
    
    return `Imported players from ${sourceSheetName}`;
  } catch (e) {
    throw new Error('Error importing players: ' + e.message);
  }
}

function adminUpdateStats(ss, body) {
  const round = String(body.round || '').trim();
  const playerId = String(body.playerId || '').trim();
  const stats = body.stats || {};
  
  if (!round || !playerId) throw new Error('Missing round or playerId');
  
  const player = getPlayerById(ss, playerId);
  if (!player) throw new Error('Player not found');
  
  const isGK = player.IsGK === true || player.IsGK === 'TRUE' || player.IsGK === 1;
  
  // Calculate points
  let points = 0;
  
  if (isGK) {
    points = (parseInt(stats.Goals || '0', 10) * 8) +
             (parseInt(stats.CleanSheet || '0', 10) * 4) +
             (parseInt(stats.PenSave || '0', 10) * 5) +
             (parseInt(stats.PenGoal || '0', 10) * 5) -
             (parseInt(stats.YC || '0', 10) * 1) -
             (parseInt(stats.SecondYC || '0', 10) * 2) -
             (parseInt(stats.RC || '0', 10) * 3) -
             (parseInt(stats.Conceded || '0', 10) * 0.5);
  } else {
    points = (parseInt(stats.Goals || '0', 10) * 5) +
             (parseInt(stats.Assists || '0', 10) * 3) +
             (parseInt(stats.CleanSheet || '0', 10) * 1) -
             (parseInt(stats.YC || '0', 10) * 1) -
             (parseInt(stats.SecondYC || '0', 10) * 2) -
             (parseInt(stats.RC || '0', 10) * 3) -
             (parseInt(stats.PenMiss || '0', 10) * 2) -
             (parseInt(stats.OwnGoal || '0', 10) * 2);
  }
  
  points = Math.round(points * 100) / 100;
  
  // Add to Points sheet
  const pointsSh = getSheet(ss, SHEETS.POINTS);
  pointsSh.appendRow([round, playerId, stats.Goals || 0, stats.Assists || 0, stats.CleanSheet || 0, 
                      stats.YC || 0, stats.SecondYC || 0, stats.RC || 0, stats.PenSave || 0, 
                      stats.PenGoal || 0, stats.PenMiss || 0, stats.OwnGoal || 0, stats.Conceded || 0]);
  
  // Update player sheet with cumulative points
  const playersSh = getSheet(ss, SHEETS.PLAYERS);
  const allPlayers = playersSh.getDataRange().getValues();
  
  for (let i = 1; i < allPlayers.length; i++) {
    if (String(allPlayers[i][0]) === playerId) {
      const colMap = {
        'Day1': 7, 'Day2': 8, 'Day3': 9, 'QF': 10, 'SF': 11, 'Final': 12
      };
      
      const roundCol = colMap[round] || 7;
      playersSh.getRange(i + 1, roundCol).setValue(points);
      
      // Update total
      let total = 0;
      for (const rnd in colMap) {
        total += parseInt(allPlayers[i][colMap[rnd] - 1] || '0', 10);
      }
      playersSh.getRange(i + 1, 6).setValue(total + points);
      
      break;
    }
  }
  
  return `Stats updated for player ${playerId} in round ${round}`;
}

function updateLeaderboard(ss, body) {
  const usersSh = getSheet(ss, SHEETS.USERS);
  const playersSh = getSheet(ss, SHEETS.PLAYERS);
  const leaderboardSh = getSheet(ss, SHEETS.LEADERBOARD);
  
  const usersData = usersSh.getDataRange().getValues();
  const playersData = playersSh.getDataRange().getValues();
  
  leaderboardSh.clearContents();
  leaderboardSh.appendRow(['UserID', 'Name', 'TeamName', 'TotalPoints', 'Day1', 'Day2', 'Day3', 'QF', 'SF', 'Final']);
  
  for (let i = 1; i < usersData.length; i++) {
    const userObj = rowToObj(usersData[0], usersData[i]);
    let playerIds = [];
    
    try { 
      playerIds = JSON.parse(userObj.PlayerIDs || '[]'); 
    } catch (e) { 
      playerIds = []; 
    }
    
    let totalPoints = 0;
    const roundPoints = { Day1: 0, Day2: 0, Day3: 0, QF: 0, SF: 0, Final: 0 };
    const captainId = userObj.CaptainID || '';
    
    playerIds.forEach(playerId => {
      for (let p = 1; p < playersData.length; p++) {
        if (String(playersData[p][0]) === playerId) {
          const playerObj = rowToObj(playersData[0], playersData[p]);
          
          let day1 = parseInt(playerObj.Day1 || '0', 10);
          let day2 = parseInt(playerObj.Day2 || '0', 10);
          let day3 = parseInt(playerObj.Day3 || '0', 10);
          let qf = parseInt(playerObj.QF || '0', 10);
          let sf = parseInt(playerObj.SF || '0', 10);
          let final = parseInt(playerObj.Final || '0', 10);
          
          if (String(playerId) === String(captainId)) {
            day1 *= 2;
            day2 *= 2;
            day3 *= 2;
            qf *= 2;
            sf *= 2;
            final *= 2;
          }
          
          roundPoints.Day1 += day1;
          roundPoints.Day2 += day2;
          roundPoints.Day3 += day3;
          roundPoints.QF += qf;
          roundPoints.SF += sf;
          roundPoints.Final += final;
          
          break;
        }
      }
    });
    
    totalPoints = roundPoints.Day1 + roundPoints.Day2 + roundPoints.Day3 + roundPoints.QF + roundPoints.SF + roundPoints.Final;
    
    leaderboardSh.appendRow([
      userObj.UserID,
      userObj.Name,
      userObj.TeamName,
      totalPoints,
      roundPoints.Day1,
      roundPoints.Day2,
      roundPoints.Day3,
      roundPoints.QF,
      roundPoints.SF,
      roundPoints.Final
    ]);
  }
  
  return 'Leaderboard updated';
}

function toggleRoundState(ss, body) {
  const round = body.round || 'Day1';
  const stateName = body.stateName || 'Active';
  const value = body.value === true || body.value === 'true' || body.value === 1;
  
  const roundsSh = getSheet(ss, SHEETS.ROUNDS);
  const data = roundsSh.getDataRange().getValues();
  
  const headers = data[0];
  const colIndex = headers.indexOf(stateName);
  
  if (colIndex < 0) throw new Error('Invalid state name');
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(round)) {
      roundsSh.getRange(i + 1, colIndex + 1).setValue(value);
      return `${stateName} set to ${value} for ${round}`;
    }
  }
  
  throw new Error('Round not found');
}

// ============= DIAGNOSTIC FUNCTIONS =============

function getDiagnosticInfo(ss) {
  const info = {
    timestamp: new Date().toISOString(),
    sheets: {},
    status: 'OK'
  };
  
  try {
    const usersSh = getSheet(ss, SHEETS.USERS);
    const usersData = usersSh.getDataRange().getValues();
    info.sheets.users = {
      rowCount: usersData.length,
      headers: usersData[0] || [],
      users: usersData.slice(1).map(row => ({
        UserID: row[0],
        Name: row[1],
        TeamName: row[2],
        Password: row[3] === undefined ? '(empty)' : '(set)'
      }))
    };
    
    const playersSh = getSheet(ss, SHEETS.PLAYERS);
    const playersData = playersSh.getDataRange().getValues();
    info.sheets.players = {
      rowCount: playersData.length,
      headers: playersData[0] || [],
      sampleRows: playersData.slice(1, 4).map(r => ({
        ID: r[0],
        Name: r[1],
        Team: r[3]
      }))
    };
    
    const leaderboardSh = getSheet(ss, SHEETS.LEADERBOARD);
    const leaderboardData = leaderboardSh.getDataRange().getValues();
    info.sheets.leaderboard = {
      rowCount: leaderboardData.length,
      headers: leaderboardData[0] || []
    };
  } catch (e) {
    info.status = 'ERROR';
    info.error = e.message;
  }
  
  return info;
}
