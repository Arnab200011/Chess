import React from 'react';
import { useDrag } from 'react-dnd';

const Piece = ({ piece, position }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'piece',
    item: { 
      type: 'piece',
      id: `${piece}${position}`,
      position,
      piece 
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const getPieceImage = () => {
    const color = piece.charAt(0);
    const type = piece.charAt(1);
    
    const pieceMap = {
      'wP': '♙', // white pawn
      'wR': '♖', // white rook
      'wN': '♘', // white knight
      'wB': '♗', // white bishop
      'wQ': '♕', // white queen
      'wK': '♔', // white king
      'bP': '♟', // black pawn
      'bR': '♜', // black rook
      'bN': '♞', // black knight
      'bB': '♝', // black bishop
      'bQ': '♛', // black queen
      'bK': '♚', // black king
    };

    return pieceMap[piece] || '';
  };

  return (
    <div
      ref={drag}
      className={`piece ${piece.charAt(0)}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        fontSize: '50px',
        fontWeight: 'bold',
        cursor: 'grab',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      {getPieceImage()}
    </div>
  );
};

export default Piece;