import React from 'react';
import { useDrop } from 'react-dnd';
import Piece from './Piece';

const Square = ({ 
  position, 
  piece, 
  isBlack, 
  isSelected, 
  isLegalMove, 
  isKingChecked,
  onDrop, 
  onClick 
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'piece',
    drop: (item) => {
      onDrop(item.position, position);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  const squareColor = isBlack ? '#b58863' : '#f0d9b5';
  const highlightColor = isOver ? 'rgba(0, 255, 0, 0.3)' : '';
  
  // Add visual indicators for selected pieces and legal moves
  let squareStyle = {
    backgroundColor: squareColor,
    width: '60px',
    height: '60px',
    position: 'relative',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };
  
  if (isSelected) {
    squareStyle.boxShadow = 'inset 0 0 0 3px rgba(0, 128, 255, 0.8)';
  }
  
  if (isKingChecked) {
    squareStyle.backgroundColor = 'rgba(255, 0, 0, 0.5)';
  }

  return (
    <div
      ref={drop}
      className={`square ${isBlack ? 'black' : 'white'} ${isSelected ? 'selected' : ''} ${isLegalMove ? 'legal-move' : ''}`}
      style={squareStyle}
      onClick={onClick}
    >
      {isOver && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            backgroundColor: highlightColor,
            zIndex: 1,
          }}
        />
      )}
      {isLegalMove && !piece && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            height: '20px',
            width: '20px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            zIndex: 1,
          }}
        />
      )}
      {isLegalMove && piece && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            border: '3px solid rgba(255, 0, 0, 0.5)',
            boxSizing: 'border-box',
            zIndex: 1,
          }}
        />
      )}
      {piece && <Piece piece={piece} position={position} />}
      <div 
        style={{
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          fontSize: '10px',
          color: isBlack ? '#f0d9b5' : '#b58863',
          opacity: 0.8,
        }}
      >
        {position}
      </div>
    </div>
  );
};

export default Square;