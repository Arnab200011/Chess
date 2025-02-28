// Initial board setup
export const getInitialBoardState = () => {
  return {
    'a8': 'bR', 'b8': 'bN', 'c8': 'bB', 'd8': 'bQ', 'e8': 'bK', 'f8': 'bB', 'g8': 'bN', 'h8': 'bR',
    'a7': 'bP', 'b7': 'bP', 'c7': 'bP', 'd7': 'bP', 'e7': 'bP', 'f7': 'bP', 'g7': 'bP', 'h7': 'bP',
    'a2': 'wP', 'b2': 'wP', 'c2': 'wP', 'd2': 'wP', 'e2': 'wP', 'f2': 'wP', 'g2': 'wP', 'h2': 'wP',
    'a1': 'wR', 'b1': 'wN', 'c1': 'wB', 'd1': 'wQ', 'e1': 'wK', 'f1': 'wB', 'g1': 'wN', 'h1': 'wR'
  };
};

// Convert chess notation to array indices
const positionToIndices = (position) => {
  const file = position.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = 8 - parseInt(position[1]);
  return { rank, file };
};

// Convert array indices to chess notation
const indicesToPosition = (rank, file) => {
  const fileChar = String.fromCharCode('a'.charCodeAt(0) + file);
  const rankChar = String(8 - rank);
  return `${fileChar}${rankChar}`;
};

// Check if a position is on the board
const isOnBoard = (rank, file) => {
  return rank >= 0 && rank < 8 && file >= 0 && file < 8;
};

// Find the position of a king
export const getKingPosition = (boardState, color) => {
  for (const [position, piece] of Object.entries(boardState)) {
    if (piece === `${color}K`) {
      return position;
    }
  }
  return null;
};

// Check if a move would put the player's own king in check
const wouldBeInCheck = (fromPosition, toPosition, boardState, playerColor) => {
  // Create a new board state with the move applied
  const newBoardState = { ...boardState };
  const piece = newBoardState[fromPosition];
  
  // Apply the move
  delete newBoardState[fromPosition];
  newBoardState[toPosition] = piece;
  
  // Check if the king is in check in this new position
  return isKingInCheck(newBoardState, playerColor);
};

// Check if the king is in check
export const isKingInCheck = (boardState, kingColor) => {
  const kingPosition = getKingPosition(boardState, kingColor);
  if (!kingPosition) return false;
  
  const opponentColor = kingColor === 'w' ? 'b' : 'w';
  
  // Check if any opponent piece can capture the king
  for (const [position, piece] of Object.entries(boardState)) {
    if (piece && piece[0] === opponentColor) {
      if (isValidMove(position, kingPosition, piece, boardState, false)) {
        return true;
      }
    }
  }
  
  return false;
};

// Get all legal moves for a piece
export const getLegalMoves = (position, boardState, playerColor) => {
  const piece = boardState[position];
  if (!piece || piece[0] !== playerColor) return [];
  
  const legalMoves = [];
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
  
  // Check all possible positions on the board
  for (const rank of ranks) {
    for (const file of files) {
      const targetPosition = `${file}${rank}`;
      // Skip the current position
      if (targetPosition === position) continue;
      
      // Check if the move is valid and doesn't put/leave the king in check
      if (isValidMove(position, targetPosition, piece, boardState, true)) {
        legalMoves.push(targetPosition);
      }
    }
  }
  
  return legalMoves;
};

// Check if a player has any legal moves
export const hasLegalMoves = (boardState, playerColor) => {
  for (const [position, piece] of Object.entries(boardState)) {
    if (piece && piece[0] === playerColor) {
      const moves = getLegalMoves(position, boardState, playerColor);
      if (moves.length > 0) {
        return true;
      }
    }
  }
  return false;
};

// Check if a move is valid
export const isValidMove = (fromPosition, toPosition, piece, boardState, checkForCheck = true) => {
  // Can't move to a square with a piece of the same color
  if (boardState[toPosition] && boardState[toPosition][0] === piece[0]) {
    return false;
  }

  const { rank: fromRank, file: fromFile } = positionToIndices(fromPosition);
  const { rank: toRank, file: toFile } = positionToIndices(toPosition);
  
  const pieceType = piece[1];
  const pieceColor = piece[0];
  
  let isValid = false;
  
  // Different movement rules for each piece type
  switch (pieceType) {
    case 'P': // Pawn
      isValid = isValidPawnMove(fromRank, fromFile, toRank, toFile, pieceColor, boardState);
      break;
    case 'R': // Rook
      isValid = isValidRookMove(fromRank, fromFile, toRank, toFile, boardState);
      break;
    case 'N': // Knight
      isValid = isValidKnightMove(fromRank, fromFile, toRank, toFile);
      break;
    case 'B': // Bishop
      isValid = isValidBishopMove(fromRank, fromFile, toRank, toFile, boardState);
      break;
    case 'Q': // Queen
      isValid = isValidQueenMove(fromRank, fromFile, toRank, toFile, boardState);
      break;
    case 'K': // King
      isValid = isValidKingMove(fromRank, fromFile, toRank, toFile);
      break;
    default:
      isValid = false;
  }
  
  // If the move is valid according to piece rules, check if it would put/leave the king in check
  if (isValid && checkForCheck) {
    if (wouldBeInCheck(fromPosition, toPosition, boardState, pieceColor)) {
      return false;
    }
  }
  
  return isValid;
};

// Check if a pawn move is valid
const isValidPawnMove = (fromRank, fromFile, toRank, toFile, pieceColor, boardState) => {
  const direction = pieceColor === 'w' ? -1 : 1;
  const startRank = pieceColor === 'w' ? 6 : 1;
  
  // Forward movement
  if (fromFile === toFile) {
    // Single square forward
    if (toRank === fromRank + direction) {
      return !boardState[indicesToPosition(toRank, toFile)];
    }
    
    // Double square forward from starting position
    if (fromRank === startRank && toRank === fromRank + 2 * direction) {
      const intermediatePosition = indicesToPosition(fromRank + direction, fromFile);
      return !boardState[intermediatePosition] && !boardState[indicesToPosition(toRank, toFile)];
    }
  }
  
  // Capture diagonally
  if (toRank === fromRank + direction && Math.abs(toFile - fromFile) === 1) {
    return boardState[indicesToPosition(toRank, toFile)] && 
           boardState[indicesToPosition(toRank, toFile)][0] !== pieceColor;
  }
  
  return false;
};

// Check if a rook move is valid
const isValidRookMove = (fromRank, fromFile, toRank, toFile, boardState) => {
  // Rook moves horizontally or vertically
  if (fromRank !== toRank && fromFile !== toFile) {
    return false;
  }
  
  // Check if path is clear
  if (fromRank === toRank) {
    // Horizontal movement
    const start = Math.min(fromFile, toFile);
    const end = Math.max(fromFile, toFile);
    
    for (let file = start + 1; file < end; file++) {
      if (boardState[indicesToPosition(fromRank, file)]) {
        return false;
      }
    }
  } else {
    // Vertical movement
    const start = Math.min(fromRank, toRank);
    const end = Math.max(fromRank, toRank);
    
    for (let rank = start + 1; rank < end; rank++) {
      if (boardState[indicesToPosition(rank, fromFile)]) {
        return false;
      }
    }
  }
  
  return true;
};

// Check if a knight move is valid
const isValidKnightMove = (fromRank, fromFile, toRank, toFile) => {
  const rankDiff = Math.abs(toRank - fromRank);
  const fileDiff = Math.abs(toFile - fromFile);
  
  // Knight moves in an L-shape: 2 squares in one direction and 1 square perpendicular
  return (rankDiff === 2 && fileDiff === 1) || (rankDiff === 1 && fileDiff === 2);
};

// Check if a bishop move is valid
const isValidBishopMove = (fromRank, fromFile, toRank, toFile, boardState) => {
  const rankDiff = Math.abs(toRank - fromRank);
  const fileDiff = Math.abs(toFile - fromFile);
  
  // Bishop moves diagonally
  if (rankDiff !== fileDiff) {
    return false;
  }
  
  // Check if path is clear
  const rankDirection = toRank > fromRank ? 1 : -1;
  const fileDirection = toFile > fromFile ? 1 : -1;
  
  for (let i = 1; i < rankDiff; i++) {
    const rank = fromRank + i * rankDirection;
    const file = fromFile + i * fileDirection;
    
    if (boardState[indicesToPosition(rank, file)]) {
      return false;
    }
  }
  
  return true;
};

// Check if a queen move is valid
const isValidQueenMove = (fromRank, fromFile, toRank, toFile, boardState) => {
  // Queen can move like a rook or a bishop
  return isValidRookMove(fromRank, fromFile, toRank, toFile, boardState) || 
         isValidBishopMove(fromRank, fromFile, toRank, toFile, boardState);
};

// Check if a king move is valid
const isValidKingMove = (fromRank, fromFile, toRank, toFile) => {
  const rankDiff = Math.abs(toRank - fromRank);
  const fileDiff = Math.abs(toFile - fromFile);
  
  // King moves one square in any direction
  return rankDiff <= 1 && fileDiff <= 1;
};