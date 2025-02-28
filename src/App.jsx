import React from 'react';
import Board from './components/Board';
import './App.css';

function App() {
  return (
    <div className="chess-app">
      <header className="app-header">
        <h1>Chess</h1>
      </header>
      <main className="app-main">
        <Board />
      </main>
      <footer className="app-footer">
        <p>Created by Arnab Mondal</p>
      </footer>
    </div>
  );
}

export default App;