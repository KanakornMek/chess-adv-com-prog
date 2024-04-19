class Piece {
    constructor(type, color, icon, row, col) {
        this.type = type;
        this.color = color;
        this.icon = icon;
        this.row = row;
        this.col = col;
        this.element = document.createElement("img");
        this.element.classList.add("piece");
        this.element.src = icon
        this.element.dataset.row = row;
        this.element.dataset.col = col;
        this.element.draggable = true;
        this.element.addEventListener("dragstart", this.handleDragStart.bind(this));
    }

    handleDragStart(event) {
        event.dataTransfer.setData("text/plain", null);
        event.dataTransfer.effectAllowed = 'move'
        draggedPiece = this
    }

    moveTo(row, col) {
        this.row = row;
        this.col = col;
        this.element.dataset.row = row;
        this.element.dataset.col = col;
    }

    canMoveTo(row, col) {
        return true;
    }

    canCaptureAt(row, col) {
        return true;
    }
}

class Pawn extends Piece {
    constructor(color, row, col) {
        super("P", color, "assets/" + (color === "W" ? "w_pawn" : "b_pawn") + ".svg", row, col);
    }

}

class Rook extends Piece {
    constructor(color, row, col) {
        super("R", color, "assets/" + (color === "W" ? "w_rook" : "b_rook") + ".svg", row, col);
    }
}

let draggedPiece = null;
let prevDragOverCell = null;
document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const pieces = [];

    function createBoard() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.style.backgroundColor = ((i + j) % 2 === 0 ? "#b58863" : "#f0d9b5")
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener("click", handleCellClick);
                cell.addEventListener("dragover", handleDragOver);
                cell.addEventListener("drop", handleDrop);
                board.appendChild(cell);
            }
        }
    }

    function initializePieces() {
        pieces.push(new Rook("W", 0, 0));
        // pieces.push(new Knight("W", 0, 1));
        // pieces.push(new Bishop("W", 0, 2));
        // pieces.push(new Queen("W", 0, 3));
        // pieces.push(new King("W", 0, 4));
        // pieces.push(new Bishop("W", 0, 5));
        // pieces.push(new Knight("W", 0, 6));
        pieces.push(new Rook("W", 0, 7));
        for (let i = 0; i < 8; i++) {
            pieces.push(new Pawn("W", 1, i));
        }

        pieces.push(new Rook("B", 7, 0));
        // pieces.push(new Knight("B", 7, 1));
        // pieces.push(new Bishop("B", 7, 2));
        // pieces.push(new Queen("B", 7, 3));
        // pieces.push(new King("B", 7, 4));
        // pieces.push(new Bishop("B", 7, 5));
        // pieces.push(new Knight("B", 7, 6));
        pieces.push(new Rook("B", 7, 7));
        for (let i = 0; i < 8; i++) {
            pieces.push(new Pawn("B", 6, i));
        }

        pieces.forEach(piece => {
            const cell = getCell(piece.row, piece.col);
            cell.appendChild(piece.element);
        });
    }

    function handleCellClick() {
        const selectedCell = this;
        console.log("Clicked on cell:", selectedCell.dataset.row, selectedCell.dataset.col);
    }

    function handleDragOver(event) {
        event.preventDefault();
        const currentDragOverCell = this;
        if (currentDragOverCell !== prevDragOverCell) {
            const droppedRow = parseInt(this.dataset.row);
            const droppedCol = parseInt(this.dataset.col);
            if (draggedPiece && draggedPiece.canMoveTo(droppedRow, droppedCol)) {
                event.dataTransfer.dropEffect = "none";
            } else {
                event.dataTransfer.dropEffect = "none";
            }
        }
        prevDragOverCell = currentDragOverCell;
    }

    function handleDrop(event) {
        event.preventDefault();
        const droppedRow = parseInt(this.dataset.row);
        const droppedCol = parseInt(this.dataset.col);
        console.log(droppedCol)
        console.log(droppedRow)
        if (draggedPiece && draggedPiece.canMoveTo(droppedRow, droppedCol)) {
            draggedPiece.moveTo(droppedRow, droppedCol);
            this.appendChild(draggedPiece.element);
        }
    }

    function getCell(row, col) {
        return document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
    }

    createBoard();
    initializePieces();
});
