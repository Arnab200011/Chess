import React, { useState, useEffect } from 'react';
import Square from './Square';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  isValidMove, 
  getInitialBoardState, 
  getKingPosition, 
  isKingInCheck, 
  hasLegalMoves,
  getLegalMoves
} from '../utils/chess';

const Board = () => {
  const [boardState, setBoardState] = useState(getInitialBoardState());
  const [currentPlayer, setCurrentPlayer] = useState('w');
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [gameStatus, setGameStatus] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isCheck, setIsCheck] = useState(false);

  // Check for checkmate or stalemate after each move
  useEffect(() => {
    if (isKingInCheck(boardState, currentPlayer)) {
      setIsCheck(true);
      if (!hasLegalMoves(boardState, currentPlayer)) {
        setGameStatus(`Checkmate! ${currentPlayer === 'w' ? 'Black' : 'White'} wins!`);
        setIsGameOver(true);
      } else {
        setGameStatus(`${currentPlayer === 'w' ? 'White' : 'Black'} is in check!`);
      }
    } else {
      setIsCheck(false);
      if (!hasLegalMoves(boardState, currentPlayer)) {
        setGameStatus('Stalemate! The game is a draw.');
        setIsGameOver(true);
      }
    }
  }, [boardState, currentPlayer]);

  const handleSquareClick = (position) => {
    const piece = boardState[position];
    
    // If game is over, don't allow any moves
    if (isGameOver) return;
    
    // If a piece is already selected
    if (selectedPosition) {
      // If clicking on the same piece, deselect it
      if (position === selectedPosition) {
        setSelectedPosition(null);
        setLegalMoves([]);
        return;
      }
      
      // If clicking on a legal move position, move the piece
      if (legalMoves.includes(position)) {
        handleMove(selectedPosition, position);
        setSelectedPosition(null);
        setLegalMoves([]);
        return;
      }
      
      // If clicking on another piece of the same color, select that piece instead
      if (piece && piece.charAt(0) === currentPlayer) {
        setSelectedPosition(position);
        setLegalMoves(getLegalMoves(position, boardState, currentPlayer));
        return;
      }
      
      // If clicking on an empty square or opponent's piece that's not a legal move
      setSelectedPosition(null);
      setLegalMoves([]);
      return;
    }
    
    // If no piece is selected yet and clicked on a piece of current player's color
    if (piece && piece.charAt(0) === currentPlayer) {
      setSelectedPosition(position);
      setLegalMoves(getLegalMoves(position, boardState, currentPlayer));
    }
  };

  const handleDrop = (fromPosition, toPosition) => {
    // If game is over, don't allow any moves
    if (isGameOver) return;
    
    handleMove(fromPosition, toPosition);
  };

  const handleMove = (fromPosition, toPosition) => {
    // Get the piece at the from position
    const piece = boardState[fromPosition];
    
    if (!piece) return;
    
    // Check if it's the current player's turn
    if (piece.charAt(0) !== currentPlayer) {
      setGameStatus(`It's ${currentPlayer === 'w' ? 'White' : 'Black'}'s turn`);
      return;
    }
    
    // Check if the move is valid and doesn't put/leave the king in check
    if (isValidMove(fromPosition, toPosition, piece, boardState, true)) {
      // Create a new board state
      const newBoardState = { ...boardState };
      
      // Remove the piece from the old position
      delete newBoardState[fromPosition];
      
      // Place the piece in the new position
      newBoardState[toPosition] = piece;
      
      // Handle pawn promotion (automatically to queen for simplicity)
      if (piece.charAt(1) === 'P') {
        const rank = toPosition.charAt(1);
        if ((piece.charAt(0) === 'w' && rank === '8') || (piece.charAt(0) === 'b' && rank === '1')) {
          newBoardState[toPosition] = `${piece.charAt(0)}Q`;
        }
      }
      
      // Update the board state
      setBoardState(newBoardState);
      
      // Switch players
      setCurrentPlayer(currentPlayer === 'w' ? 'b' : 'w');
      
      // Update game status
      setGameStatus(`${currentPlayer === 'w' ? 'White' : 'Black'} moved ${piece.charAt(1)} from ${fromPosition} to ${toPosition}`);
    } else {
      setGameStatus('Invalid move');
    }
  };

  const resetGame = () => {
    setBoardState(getInitialBoardState());
    setCurrentPlayer('w');
    setSelectedPosition(null);
    setLegalMoves([]);
    setGameStatus('');
    setIsGameOver(false);
    setIsCheck(false);
  };

  const renderSquares = () => {
    const squares = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const position = `${files[j]}${ranks[i]}`;
        const isBlack = (i + j) % 2 !== 0;
        const piece = boardState[position];
        const isSelected = position === selectedPosition;
        const isLegalMove = legalMoves.includes(position);
        const isKingChecked = piece && piece.charAt(1) === 'K' && piece.charAt(0) === currentPlayer && isCheck;

        squares.push(
          <Square
            key={position}
            position={position}
            piece={piece}
            isBlack={isBlack}
            isSelected={isSelected}
            isLegalMove={isLegalMove}
            isKingChecked={isKingChecked}
            onDrop={handleDrop}
            onClick={() => handleSquareClick(position)}
          />
        );
      }
    }

    return squares;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="board-container">
        <div className="game-status">
          <h2>{isGameOver ? 'Game Over' : `${currentPlayer === 'w' ? 'White' : 'Black'} to move`}</h2>
          <p>{gameStatus}</p>
          {isGameOver && (
            <button 
              onClick={resetGame}
              className="reset-button"
            >
              New Game
            </button>
          )}
        </div>
        <div
          className="board"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 60px)',
            gridTemplateRows: 'repeat(8, 60px)',
            border: '2px solid #333',
            width: 'fit-content',
          }}
        >
          {renderSquares()}
        </div>
      </div>
    </DndProvider>
  );
};

export default Board;