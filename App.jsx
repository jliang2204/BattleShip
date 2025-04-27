import { useState, useEffect } from 'react';
import "./style.css";


//Store 4 grids, 1 per player's board, 1 per tracking hits board
function App() {
  const [player1Grid, setPlayer1Grid] = useState(Array(10).fill(null).map(() => Array(10).fill(null)));
  const [targetP2Grid, setTargetP2Grid] = useState(Array(10).fill(null).map(() => Array(10).fill(null)));
  const [p2RemainingShips, setP2RemainingShips] = useState({ A:5, B:4, S:3 });
  const [p2ShipStatus, setP2ShipStatus] = useState({ A:"ONLINE", B:"ONLINE", S:"ONLINE" })
  const [p2OnOff, setP2OnOff] = useState({ A:"ship-online", B:"ship-online", S:"ship-online"});
  const [player2Grid, setPlayer2Grid] = useState(Array(10).fill(null).map(() => Array(10).fill(null)));
  const [targetP1Grid, setTargetP1Grid] = useState(Array(10).fill(null).map(() => Array(10).fill(null)));
  const [p1RemainingShips, setP1RemainingShips] = useState({ A:5, B:4, S:3 });
  const [p1ShipStatus, setP1ShipStatus] = useState({ A:"ONLINE", B:"ONLINE", S:"ONLINE" })
  const [p1OnOff, setP1OnOff] = useState({ A:"ship-online", B:"ship-online", S:"ship-online"});
  const [screen, setScreen] = useState("player1");
  const [player1Name, setPlayer1Name] = useState("");
  const [player1Setup, setPlayer1Setup] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [player2Setup, setPlayer2Setup] = useState("");
  const [popUpMessage, setPopUpMessage] = useState("");
  const [lockTurn, setLockTurn] = useState(false);
  const [endGame, setEndGame] = useState({ winner: "", loser: "" });
  const [winnerScore, setWinnerScore] = useState(24);

  const checkWinner = (winnerRemainingShips, winnerName, loserName) => {
      const newEndGame = { ...endGame };
      newEndGame["winner"] = winnerName;
      newEndGame["loser"] = loserName;
      let newWinnerScore = (24 - (2 * (5 - winnerRemainingShips["A"]) + (2 * (4 - winnerRemainingShips["B"]) + (2 * (3 - winnerRemainingShips["S"])))));
      setWinnerScore(newWinnerScore);
      setEndGame(newEndGame);
      setScreen("endScreen");
  }

  //Updates the text and color indicating whethere each ship has been sunk or online
  const updateShipStatus = (remainingShips, setShipStatus, setOnOff) => {
    const newStatus = { ...remainingShips };
    const newOnOff = { ...remainingShips };
    Object.keys(newStatus).forEach((ship) => {
      newStatus[ship] = remainingShips[ship] === 0 ? "SUNK" : "ONLINE";
      newOnOff[ship] = remainingShips[ship] === 0 ? "ship-offline" : "ship-online";
    });

    setOnOff(newOnOff);
    setShipStatus(newStatus);
  }

  const handleClick = (row, col) => {
    if(lockTurn) return;

    if(screen === "p1turn") {
      handlePlayerTurn(row, col, player2Grid, setPlayer2Grid, targetP2Grid, setTargetP2Grid, p2RemainingShips, setP2RemainingShips, "readyp2turn", setP2ShipStatus, setP2OnOff, p1RemainingShips, player1Name, player2Name);
    } else if(screen === "p2turn") {
      handlePlayerTurn(row, col, player1Grid, setPlayer1Grid, targetP1Grid, setTargetP1Grid, p1RemainingShips, setP1RemainingShips, "readyp1turn", setP1ShipStatus, setP1OnOff, p2RemainingShips, player2Name, player1Name);
    }
  };

  const handlePlayerTurn = (row, col, opponentGrid, setOpponentGrid, targetGrid, setTargetGrid, remainingShips, setRemainingShips, nextScreen, setOpponentShipStatus, setOnOff, curRemainingShips, playerName, enemyName) => {
    const newTargetGrid = targetGrid.map(r => [...r]);
    const newOpponentGrid = opponentGrid.map(r => [...r]);
    const newRemainingShips = { ...remainingShips };

    //Clicked on a grid thats already been clicked on
    if(newTargetGrid[row][col] !== null) {
      setPopUpMessage("Invalid Selection. Try again!");
      setTimeout(() => setPopUpMessage(""), 1000);
      return;
    }

    //prevents additional clicks while verifying and showing hit or miss
    setLockTurn(true);

    //hit 
    if(opponentGrid[row][col] !== null) {
      const shipType = opponentGrid[row][col];
      newTargetGrid[row][col] = "hit";


      newRemainingShips[shipType]--;

      if(newRemainingShips[shipType] === 0) {
        updateShipStatus(newRemainingShips, setOpponentShipStatus, setOnOff);
        if(newRemainingShips["A"] === 0 && newRemainingShips["B"] === 0 && newRemainingShips["S"] === 0) {
          checkWinner(curRemainingShips, playerName, enemyName);
          setLockTurn(false);
          return;
        }
      }
    } else {
      //MISS
      newTargetGrid[row][col] = "miss";
    }

    setTargetGrid(newTargetGrid);
    setOpponentGrid(newOpponentGrid);
    setRemainingShips(newRemainingShips);
    setTimeout(() => {
      setScreen(nextScreen);
      setLockTurn(false);
    }, 200);
  }

  //converts notation into row and column
  const getIndices = (pos) => {
    const col = pos[0].charCodeAt(0) - 'A'.charCodeAt(0);
    const row = parseInt(pos.substring(1), 10) - 1;
    return { row, col };
  };

  //Set up board based on notation entered
  const setupBoard = (setupString, setGridType) => {
    const newGrid = Array(10).fill(null).map(() => Array(10).fill(null));

    const shipParts = setupString.split(";").filter(part => part.trim() !== "");

    shipParts.forEach((part) => {
      const shipType = part[0];
      const range = part.substring(2, part.length - 1);

      let [start, end] = range.split("-");
      let { row: startRow, col: startCol } = getIndices(start);
      let { row: endRow, col: endCol } = getIndices(end);

      if(startRow > endRow || startCol > endCol) {
        [startRow, endRow] = [endRow, startRow];
        [startCol, endCol] = [endCol, startCol];
      }

      if(startRow === endRow) {
        for(let col = startCol; col <= endCol; col++) {
          newGrid[startRow][col] = shipType;
        }
      } else if(startCol === endCol) {
        for(let row = startRow; row <= endRow; row++) {
          newGrid[row][startCol] = shipType;
        }
      }
    });

    setGridType(newGrid);
  };

  //Allow clicking enter from anywhere on the page and not just while in textboxes
  useEffect(() => {
    const handleKeyDown = (event) => {
      if(event.key === "Enter" && screen === "player1") {
        if(player1Name === "") {
          setPlayer1Name("Player 1");
        }
        setupBoard(player1Setup, setPlayer1Grid);
        setScreen("player2");
      }

      else if(event.key === "Enter" && screen === "player2") {
        if(player2Name === "") {
          setPlayer2Name("Player 2");
        }
        setupBoard(player2Setup, setPlayer2Grid);
        setScreen("readyp1turn");
      }
    };
  
    document.addEventListener("keydown", handleKeyDown);
  
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [screen, player1Setup, player2Setup]);
  
  return (
    <div>
      {screen === "player1" && ( 
        <div>
          <h1 className="title">Welcome to Battleship!</h1>
          <h2 className="title2">
            Enter Player 1's Name:
            <input 
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="Player 1"
              style={{ marginLeft: "10px" }}
            />
        </h2>
        <h3 className="title3">
          Enter Board Setup:
          <input
          type="text"
          value={player1Setup}
          onChange={(e) => setPlayer1Setup(e.target.value)}
          placeholder="A(A1-A5);B(B6-E6);S(H3-J3);"
          style={{ marginLeft: "10px", width: "175px" }}
          />
        </h3>
    </div>
    )}

    {screen === "player2" && (
      <div>
        <h1 className="title">Welcome to Battleship!</h1>
        <h2 className="title2">
          Enter Player 2's Name:
          <input
            type="text"
            value={player2Name}
            onChange={(e) => setPlayer2Name(e.target.value)}
            placeholder="Player 2"
            style={{ marginLeft: "10px" }}
            />
        </h2>
        <h3 className="title3">
          Enter Board Setup:
          <input
          type="text"
          value={player2Setup}
          onChange={(e) => setPlayer2Setup(e.target.value)}
          placeholder="A(A1-A5);B(B6-E6);S(H3-J3);"
          style={{ marginLeft: "10px", width: "175px" }}
          />
        </h3>
      </div>
    )}

    {screen === "readyp1turn" && (
      <div>
        <h1 className="title">Click OK to begin {player1Name}'s turn</h1>
        <button className="button" onClick={() => setScreen("p1turn")}>OK</button>
        </div>
    )}

    {screen === "p1turn" && (
      <div style={{ marginTop: "50px", marginLeft: "200px", display: "flex", gap: "250px" }}>
        <div>
          <h2>{player1Name}'s Board</h2>
          <GameBoard grid={player1Grid} clickHandler={() => {}} targetGrid={targetP1Grid} />
          <h2 style={{ marginBottom: "1px" }}>Ship Status:</h2>
          <h3 className={p1OnOff.A} style={{ marginTop: "1px", marginBottom: "1px" }}>A: {p1ShipStatus.A}</h3>
          <h3 className={p1OnOff.B} style={{ marginTop: "1px", marginBottom: "1px" }}>B: {p1ShipStatus.B}</h3>
          <h3 className={p1OnOff.S} style={{ marginTop: "1px", marginBottom: "1px" }}>S: {p1ShipStatus.S}</h3>
        </div>
        <div>
          <h2>Target {player2Name}'s Board</h2>
          <GameBoard grid={targetP2Grid} clickHandler={handleClick} targetGrid={targetP2Grid} />
          <h2 style={{ marginBottom: "1px" }}>Ship Status:</h2>
          <h3 className={p2OnOff.A} style={{ marginTop: "1px", marginBottom: "1px" }}>A: {p2ShipStatus.A}</h3>
          <h3 className={p2OnOff.B} style={{ marginTop: "1px", marginBottom: "1px" }}>B: {p2ShipStatus.B}</h3>
          <h3 className={p2OnOff.S} style={{ marginTop: "1px", marginBottom: "1px" }}>S: {p2ShipStatus.S}</h3>
        </div>
      </div>
    )}

    {screen === "readyp2turn" && (
      <div>
        <h1 className="title">Click OK to begin {player2Name}'s turn</h1>
        <button className="button" onClick={() => setScreen("p2turn")}>OK</button>
        </div>
    )}

    {screen === "p2turn" && (
      <div style = {{ marginTop: "50px", marginLeft: "200px", display: "flex", gap: "250px" }}>
        <div>
          <h2>{player2Name}'s Board</h2>
          <GameBoard grid={player2Grid} clickHandler={() => {}} targetGrid={targetP2Grid} />
          <h2 style={{ marginBottom: "1px" }}>Ship Status:</h2>
          <h3 className={p2OnOff.A} style={{ marginTop: "1px", marginBottom: "1px" }}>A: {p2ShipStatus.A}</h3>
          <h3 className={p2OnOff.B} style={{ marginTop: "1px", marginBottom: "1px" }}>B: {p2ShipStatus.B}</h3>
          <h3 className={p2OnOff.S} style={{ marginTop: "1px", marginBottom: "1px" }}>S: {p2ShipStatus.S}</h3>
          </div>
        <div>
          <h2>Target {player1Name}'s Board</h2>
          <GameBoard grid={targetP1Grid} clickHandler={handleClick} targetGrid={targetP1Grid} />
          <h2 style={{ marginBottom: "1px" }}>Ship Status:</h2>
          <h3 className={p1OnOff.A} style={{ marginTop: "1px", marginBottom: "1px" }}>A: {p1ShipStatus.A}</h3>
          <h3 className={p1OnOff.B} style={{ marginTop: "1px", marginBottom: "1px" }}>B: {p1ShipStatus.B}</h3>
          <h3 className={p1OnOff.S} style={{ marginTop: "1px", marginBottom: "1px" }}>S: {p1ShipStatus.S}</h3>
        </div>
      </div>
    )}

    {screen === "endScreen" && (
      <div>
        <h1 className="winner">Winner: {endGame.winner}</h1>
        <h1 className="winner-score">Winner Score: {winnerScore}</h1>
        <h2 className="loser">Loser: {endGame.loser}</h2>
        <h2 className="loser-score">Loser Score: 0</h2>
      </div>
    )}

    {popUpMessage && (
      <div className="popup-message">
        {popUpMessage}
      </div>
    )}
  </div>
  );
}

//Creates gameboard with proper values in each square 
function GameBoard({ grid, clickHandler, targetGrid}) {
  return (
    <div className="grid">
      {grid.map((row, rowIndex) => 
        row.map((cell, colIndex) => {
          let cellClass = "cell";
          if(targetGrid[rowIndex][colIndex] === "hit")  {
            cellClass += " hit";
          } else if(targetGrid[rowIndex][colIndex] === "miss") {
            cellClass += " miss";
          }

          return (
            <div key={`${rowIndex},${colIndex}`}
            className={cellClass} 
            onClick={() => clickHandler && clickHandler(rowIndex, colIndex)} 
            >
              {cell}
            </div>
          );
        })
      )}
    </div>
  );
}

export default App;
