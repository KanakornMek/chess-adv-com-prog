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
        this.element.dataset.color = color;
        this.element.dataset.type = type;
        this.element.dataset.row = row;
        this.element.dataset.col = col;
        this.element.draggable = true;
        this.element.addEventListener("dragstart", this.handleDragStart.bind(this));
    }

    handleDragStart(event) {
        event.dataTransfer.setData("text/plain", null);
        event.dataTransfer.effectAllowed = 'move'
        draggedPiece = this
        if (draggedPiece) {
            let moves = draggedPiece.showAllowedMove();
            moves.forEach((value) => {
                const cell = getCell(value.row, value.col);
                const moveableIcon = document.createElement("div");
                if (value.capture === true) {
                    moveableIcon.classList.add("captureable-icon");
                } else {
                    moveableIcon.classList.add("moveable-icon");
                }
                cell.appendChild(moveableIcon);

            })
        }
    }

    moveTo(row, col) {
        if (row != this.row || col != this.col) {
            enpassantPosition = { row: null, col: null };
            this.row = row;
            this.col = col;
            this.element.dataset.row = row;
            this.element.dataset.col = col;
        }
    }

    canMoveTo(row, col) {
        let allowedMoves = this.showAllowedMove(row, col)
            .filter(move => {
                return move.capture === false;
            })
        if (allowedMoves.some(move => move.row === row && move.col === col)) {
            return true;
        }
        return false;
    }

    canCaptureAt(row, col) {
        let allowedMoves = this.showAllowedMove(row, col)
            .filter(move => {
                return move.capture === true;
            })
        if (allowedMoves.some(move => move.row === row && move.col === col)) {
            return true;
        }
        return false;
    }

    showAllowedMove() {
        let allowedMoves = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                allowedMoves.push({ row: i, col: j });
            }
        }
        return allowedMoves;
    }
}

class Pawn extends Piece {
    constructor(color, row, col) {
        super("P", color, "assets/" + (color === "W" ? "w_pawn" : "b_pawn") + ".svg", row, col);
        this.firstMove = true;
    }

    moveTo(row, col) {

        if (row != this.row || col != this.col) {
            if (row == enpassantPosition.row && col == enpassantPosition.col) {
                getCell(row + (this.color == "W" ? 1 : -1), col).getElementsByClassName("piece")[0].remove();
                enpassantPosition = { row: null, col: null };
            } else if (row == (this.color == "W" ? 6 : 1) && this.firstMove == true) {
                this.firstMove = true;
            } else if (row == (this.color == "W" ? 4 : 3) && this.firstMove == true) {
                this.firstMove = false;
                enpassantPosition = { row: row - (this.color == "W" ? -1 : 1), col: col };
            } else {
                enpassantPosition = { row: null, col: null };
                this.firstMove = false;
            }
            this.row = row;
            this.col = col;
            this.element.dataset.row = row;
            this.element.dataset.col = col;
            if (row == (this.color == "W" ? 0 : 7)) {
                this.promote();
                this.element.remove();
            }
        }
    }

    promote() {
        draggedPiece = new Queen(this.color, this.row, this.col);
    }

    showAllowedMove() {
        let allowedMoves = [];
        let moveRow = (this.color == "W" ? 1 : -1);
        // En passant
        for (let value of [-1, 1]) {
            const newRow = this.row - moveRow;
            const newCol = this.col + value;
            if (newRow == enpassantPosition.row && newCol == enpassantPosition.col) {
                allowedMoves.push({ row: newRow, col: newCol, capture: true });
            }
        }

        // capture
        for (let value of [-1, 1]) {
            const newRow = this.row - moveRow;
            const newCol = this.col + value;
            if (range(0, 8).includes(newRow) && range(0, 8).includes(newCol)) {
                if (getCell(newRow, newCol).getElementsByClassName("piece").length != 0) {
                    if (getCell(newRow, newCol).getElementsByClassName("piece")[0].dataset.color != this.color) {
                        allowedMoves.push({ row: newRow, col: newCol, capture: true });
                    }
                }
            }
        };
        // normal move
        if (range(0, 8).includes(this.row - 1)) {
            if (getCell(this.row - moveRow, this.col).getElementsByClassName("piece").length == 0) {
                // first move
                if (this.firstMove && getCell(this.row - (2 * moveRow), this.col).getElementsByClassName("piece").length == 0) {
                    allowedMoves.push({ row: this.row - (2 * moveRow), col: this.col, capture: false });
                }
                allowedMoves.push({ row: this.row - moveRow, col: this.col, capture: false });
            }
        }
        return allowedMoves;
    }

}

class Rook extends Piece {
    constructor(color, row, col) {
        super("R", color, "assets/" + (color === "W" ? "w_rook" : "b_rook") + ".svg", row, col);
        this.isMoved = false;
        this.element.dataset.isMoved = false;
    }

    moveTo(row, col) {
        if (row != this.row || col != this.col) {
            enpassantPosition = { row: null, col: null };
            this.row = row;
            this.col = col;
            this.isMoved = true;
            this.element.dataset.row = row;
            this.element.dataset.col = col;
            this.element.dataset.isMoved = true;
        }
    }

    showAllowedMove() {
        let allowedMoves = [];
        for (let i = this.row + 1; i < 8; i++) {
            if (getCell(i, this.col).getElementsByClassName('piece').length == 0) {
                allowedMoves.push({ row: i, col: this.col, capture: false });
            }
            else {
                if (getCell(i, this.col).getElementsByClassName('piece')[0].dataset.color == 'W') {
                    break;
                } else {
                    allowedMoves.push({ row: i, col: this.col, capture: true });
                    break;
                }
            }
        }
        for (let i = this.row - 1; i >= 0; i--) {
            if (getCell(i, this.col).getElementsByClassName('piece').length == 0) {
                allowedMoves.push({ row: i, col: this.col, capture: false });
            }
            else {
                if (getCell(i, this.col).getElementsByClassName('piece')[0].dataset.color == 'W') {
                    break;
                } else {
                    allowedMoves.push({ row: i, col: this.col, capture: true });
                    break;
                }
            }
        }
        for (let i = this.col + 1; i < 8; i++) {
            if (getCell(this.row, i).getElementsByClassName('piece').length == 0) {
                allowedMoves.push({ row: this.row, col: i, capture: false });
            }
            else {
                if (getCell(this.row, i).getElementsByClassName('piece')[0].dataset.color == 'W') {
                    break;
                } else {
                    allowedMoves.push({ row: this.row, col: i, capture: true });
                    break;
                }
            }
        }
        for (let i = this.col - 1; i >= 0; i--) {
            if (getCell(this.row, i).getElementsByClassName('piece').length == 0) {
                allowedMoves.push({ row: this.row, col: i, capture: false });
            }
            else {
                if (getCell(this.row, i).getElementsByClassName('piece')[0].dataset.color == 'W') {
                    break;
                } else {
                    allowedMoves.push({ row: this.row, col: i, capture: true });
                    break;
                }
            }
        }

        return allowedMoves;
    }
}

class Knight extends Piece {
    constructor(color, row, col) {
        super("N", color, "assets/" + (color === "W" ? "w_knight" : "b_knight") + ".svg", row, col);
    }
    showAllowedMove() {
        let allowedMoves = [];
        const knightMoves = [
            { row: 1, col: 2 },
            { row: 1, col: -2 },
            { row: -1, col: 2 },
            { row: -1, col: -2 },
            { row: 2, col: 1 },
            { row: 2, col: -1 },
            { row: -2, col: 1 },
            { row: -2, col: -1 }
        ];
        knightMoves.forEach(move => {
            const newRow = this.row + move.row;
            const newCol = this.col + move.col;

            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                if (getCell(newRow, newCol).getElementsByClassName('piece').length == 0) {
                    allowedMoves.push({ row: newRow, col: newCol, capture: false });
                }
                else {
                    if (getCell(newRow, newCol).getElementsByClassName('piece')[0].dataset.color == 'B') {
                        allowedMoves.push({ row: newRow, col: newCol, capture: true });
                    }
                }
            }
        })
        return allowedMoves;
    }
}

class Bishop extends Piece {
    constructor(color, row, col) {
        super("B", color, "assets/" + (color === "W" ? "w_bishop" : "b_bishop") + ".svg", row, col);
    }
    showAllowedMove() {
        let allowedMoves = [];
        for (let r = this.row + 1, c = this.col + 1; r < 8 && c < 8; r++) {
            if (getCell(r, c).getElementsByClassName('piece').length == 0) {
                allowedMoves.push({ row: r, col: c, capture: false });
            }
            else {
                if (getCell(r, c).getElementsByClassName('piece')[0].dataset.color == 'W') {
                    break;
                } else {
                    allowedMoves.push({ row: r, col: c, capture: true });
                    break;
                }
            }
            c++;
        }
        for (let r = this.row + 1, c = this.col - 1; r < 8 && c >= 0; r++) {
            if (getCell(r, c).getElementsByClassName('piece').length == 0) {
                allowedMoves.push({ row: r, col: c, capture: false });
            }
            else {
                if (getCell(r, c).getElementsByClassName('piece')[0].dataset.color == 'W') {
                    break;
                } else {
                    allowedMoves.push({ row: r, col: c, capture: true });
                    break;
                }
            }
            c--;
        }
        for (let r = this.row - 1, c = this.col + 1; r >= 0 && c < 8; r--) {
            if (getCell(r, c).getElementsByClassName('piece').length == 0) {
                allowedMoves.push({ row: r, col: c, capture: false });
            }
            else {
                if (getCell(r, c).getElementsByClassName('piece')[0].dataset.color == 'W') {
                    break;
                } else {
                    allowedMoves.push({ row: r, col: c, capture: true });
                    break;
                }
            }
            c++;
        }
        for (let r = this.row - 1, c = this.col - 1; r >= 0 && c >= 0; r--) {
            if (getCell(r, c).getElementsByClassName('piece').length == 0) {
                allowedMoves.push({ row: r, col: c, capture: false });
            }
            else {
                if (getCell(r, c).getElementsByClassName('piece')[0].dataset.color == 'W') {
                    break;
                } else {
                    allowedMoves.push({ row: r, col: c, capture: true });
                    break;
                }
            }
            c--;
        }
        return allowedMoves;
    }
}

class Queen extends Piece {
    constructor(color, row, col) {
        super("Q", color, "assets/" + (color === "W" ? "w_queen" : "b_queen") + ".svg", row, col);
    }
    showAllowedMove() {
        let allowedMoves = [];
        for (let r = this.row + 1, c = this.col + 1; r < 8 && c < 8; r++) {
            if (getCell(r, c).getElementsByClassName('piece').length == 0) {
                allowedMoves.push({ row: r, col: c, capture: false });
            }
            else {
                if (getCell(r, c).getElementsByClassName('piece')[0].dataset.color == 'W') {
                    break;
                } else {
                    allowedMoves.push({ row: r, col: c, capture: true });
                    break;
                }
            }
            c++;
        }
        for (let r = this.row + 1, c = this.col - 1; r < 8 && c >= 0; r++) {
            if (getCell(r, c).getElementsByClassName('piece').length == 0) {
                allowedMoves.push({ row: r, col: c, capture: false });
            }
            else {
                if (getCell(r, c).getElementsByClassName('piece')[0].dataset.color == 'W') {
                    break;
                } else {
                    allowedMoves.push({ row: r, col: c, capture: true });
                    break;
                }
            }
            c--;
        }
        for (let r = this.row - 1, c = this.col + 1; r >= 0 && c < 8; r--) {
            if (getCell(r, c).getElementsByClassName('piece').length == 0) {
                allowedMoves.push({ row: r, col: c, capture: false });
            }
            else {
                if (getCell(r, c).getElementsByClassName('piece')[0].dataset.color == 'W') {
                    break;
                } else {
                    allowedMoves.push({ row: r, col: c, capture: true });
                    break;
                }
            }
            c++;
        }
        for (let r = this.row - 1, c = this.col - 1; r >= 0 && c >= 0; r--) {
            if (getCell(r, c).getElementsByClassName('piece').length == 0) {
                allowedMoves.push({ row: r, col: c, capture: false });
            }
            else {
                if (getCell(r, c).getElementsByClassName('piece')[0].dataset.color == 'W') {
                    break;
                } else {
                    allowedMoves.push({ row: r, col: c, capture: true });
                    break;
                }
            }
            c--;
        }
        for (let i = this.row + 1; i < 8; i++) {
            if (getCell(i, this.col).getElementsByClassName('piece').length == 0) {
                allowedMoves.push({ row: i, col: this.col, capture: false });
            }
            else {
                if (getCell(i, this.col).getElementsByClassName('piece')[0].dataset.color == 'W') {
                    break;
                } else {
                    allowedMoves.push({ row: i, col: this.col, capture: true });
                    break;
                }
            }
        }
        for (let i = this.row - 1; i >= 0; i--) {
            if (getCell(i, this.col).getElementsByClassName('piece').length == 0) {
                allowedMoves.push({ row: i, col: this.col, capture: false });
            }
            else {
                if (getCell(i, this.col).getElementsByClassName('piece')[0].dataset.color == 'W') {
                    break;
                } else {
                    allowedMoves.push({ row: i, col: this.col, capture: true });
                    break;
                }
            }
        }
        for (let i = this.col + 1; i < 8; i++) {
            if (getCell(this.row, i).getElementsByClassName('piece').length == 0) {
                allowedMoves.push({ row: this.row, col: i, capture: false });
            }
            else {
                if (getCell(this.row, i).getElementsByClassName('piece')[0].dataset.color == 'W') {
                    break;
                } else {
                    allowedMoves.push({ row: this.row, col: i, capture: true });
                    break;
                }
            }
        }
        for (let i = this.col - 1; i >= 0; i--) {
            if (getCell(this.row, i).getElementsByClassName('piece').length == 0) {
                allowedMoves.push({ row: this.row, col: i, capture: false });
            }
            else {
                if (getCell(this.row, i).getElementsByClassName('piece')[0].dataset.color == 'W') {
                    break;
                } else {
                    allowedMoves.push({ row: this.row, col: i, capture: true });
                    break;
                }
            }
        }
        return allowedMoves;
    }
}

class King extends Piece {
    constructor(color, row, col) {
        super("K", color, "assets/" + (color === "W" ? "w_king" : "b_king") + ".svg", row, col);
        this.isMoved = false;
    }

    getPiecebyRowCol(row, col) {
        for (let piece of pieces) {
            if (piece.row == row && piece.col == col) {
                return piece;
            }
        }
    }

    moveTo(row, col) {
        if (row != this.row || col != this.col) {
            enpassantPosition = { row: null, col: null };
            this.row = row;
            this.col = col;
            this.element.dataset.row = row;
            this.element.dataset.col = col;
            if (!this.isMoved && col == 2) {
                let castle = this.getPiecebyRowCol(7, 0)
                if (castle.type == "R") {
                    if (castle.isMoved == false) {
                        castle.isMoved = true;
                        castle.element.dataset.isMoved = true;
                        getCell(7, 3).appendChild(castle.element);
                        this.getPiecebyRowCol(7, 0).moveTo(7, 3);
                    }
                }
            }
            if (!this.isMoved && col == 6) {
                let castle = this.getPiecebyRowCol(7, 7)
                if (castle.type == "R") {
                    if (castle.isMoved == false) {
                        castle.isMoved = true;
                        castle.element.dataset.isMoved = true;
                        getCell(7, 5).appendChild(castle.element);
                        this.getPiecebyRowCol(7, 7).moveTo(7, 5);
                    }
                }
            }
            if (row == 7 && col == 4 && this.isMoved == false) {
                this.isMoved = false;
            } else {
                this.isMoved = true;
            }
        }
    }

    showAllowedMove() {
        let allowedMoves = [];
        if (!this.isMoved) {
            if (getCell(7, 0).getElementsByClassName("piece").length != 0) {
                if (getCell(7, 0).getElementsByClassName("piece")[0].dataset.type == "R") {
                    if (getCell(7, 0).getElementsByClassName("piece")[0].dataset.isMoved == "false") {
                        if (getCell(7, 1).getElementsByClassName("piece").length + getCell(7, 2).getElementsByClassName("piece").length + getCell(7, 3).getElementsByClassName("piece").length == 0) {
                            if (!this.cellInCheck(7, 2, "W") && !this.cellInCheck(7, 3, "W") && !this.cellInCheck(7, 4, "W")) {
                                allowedMoves.push({ row: 7, col: 2, capture: false });
                            }
                        }
                    }
                }
            }
            if (getCell(7, 7).getElementsByClassName("piece").length != 0) {
                if (getCell(7, 7).getElementsByClassName("piece")[0].dataset.type == "R") {
                    if (getCell(7, 7).getElementsByClassName("piece")[0].dataset.isMoved == "false") {
                        if (getCell(7, 5).getElementsByClassName("piece").length + getCell(7, 6).getElementsByClassName("piece").length == 0) {
                            if (!this.cellInCheck(7, 4, "W") && !this.cellInCheck(7, 5, "W") && !this.cellInCheck(7, 6, "W")) {
                                allowedMoves.push({ row: 7, col: 6, capture: false });
                            }
                        }
                    }
                }
            }
        }

        const kingMoves = [
            { row: 1, col: 1 },
            { row: 0, col: 1 },
            { row: -1, col: 1 },
            { row: 1, col: 0 },
            { row: -1, col: 0 },
            { row: 1, col: -1 },
            { row: 0, col: -1 },
            { row: -1, col: -1 },
        ]

        for (let i = 0; i < kingMoves.length; i++) {
            let move = kingMoves[i];
            let newRow = this.row + move.row;
            let newCol = this.col + move.col;
            if (range(0, 8).includes(newRow) && range(0, 8).includes(newCol)) {
                if (!this.cellInCheck(newRow, newCol, this.color)) {
                    if (getCell(newRow, newCol).getElementsByClassName("piece").length == 0) {
                        allowedMoves.push({ row: newRow, col: newCol, capture: false });
                    } else if (getCell(newRow, newCol).getElementsByClassName("piece")[0].dataset.color != this.color) {
                        allowedMoves.push({ row: newRow, col: newCol, capture: true });
                    }
                }
            }
        }
        return allowedMoves;
    }

    cellInCheck(row, col, kingColor) {

        // check Knight
        const knightMoves = [
            { row: 1, col: 2 },
            { row: 1, col: -2 },
            { row: -1, col: 2 },
            { row: -1, col: -2 },
            { row: 2, col: 1 },
            { row: 2, col: -1 },
            { row: -2, col: 1 },
            { row: -2, col: -1 }
        ];

        for (let i = 0; i < knightMoves.length; i++) {
            let move = knightMoves[i];
            let newRow = row + move.row;
            let newCol = col + move.col;
            if (range(0, 8).includes(newRow) && range(0, 8).includes(newCol)) {
                if (getCell(newRow, newCol).getElementsByClassName("piece").length != 0) {
                    let knightPiece = getCell(newRow, newCol).getElementsByClassName("piece");
                    if (knightPiece[0].dataset.type == "N" && knightPiece[0].dataset.color != kingColor) {
                        return true;
                    }
                }
            }
        }

        // check for King of another color
        const kingMoves = [
            { row: 1, col: 1 },
            { row: 0, col: 1 },
            { row: -1, col: 1 },
            { row: 1, col: 0 },
            { row: -1, col: 0 },
            { row: 1, col: -1 },
            { row: 0, col: -1 },
            { row: -1, col: -1 },
        ]

        for (let i = 0; i < kingMoves.length; i++) {
            let move = kingMoves[i];
            let newRow = row + move.row;
            let newCol = col + move.col;
            if (range(0, 8).includes(newRow) && range(0, 8).includes(newCol)) {
                if (getCell(newRow, newCol).getElementsByClassName("piece").length != 0) {
                    let kingPiece = getCell(newRow, newCol).getElementsByClassName("piece");
                    if (kingPiece[0].dataset.type == "K" && kingPiece[0].dataset.color != kingColor) {
                        return true;
                    }
                }
            }
        }

        let leftCol = range(0, col);
        let rightCol = range(col + 1, 8);
        let upRow = range(0, row);
        let downRow = range(row + 1, 8);

        // check horizontal left cell: Rook and Queen
        for (let i = leftCol.length - 1; i >= 0; i--) {
            let pieceInWay = getCell(row, leftCol[i]).getElementsByClassName("piece");
            if (pieceInWay.length != 0) {
                if (pieceInWay[0].dataset.color == kingColor) {
                    break;
                } else if (["N", "P", "B"].includes(pieceInWay[0].dataset.type)) {
                    break;
                } else if (["Q", "R"].includes(pieceInWay[0].dataset.type)) {
                    return true;
                }
            }
        }

        for (let i = 0; i < rightCol.length; i++) {
            let pieceInWay = getCell(row, rightCol[i]).getElementsByClassName("piece");
            if (pieceInWay.length != 0) {
                if (pieceInWay[0].dataset.color == kingColor) {
                    break;
                } else if (["N", "P", "B"].includes(pieceInWay[0].dataset.type)) {
                    break;
                } else if (["Q", "R"].includes(pieceInWay[0].dataset.type)) {
                    return true;
                }
            }
        }

        for (let i = upRow.length - 1; i >= 0; i--) {
            let pieceInWay = getCell(upRow[i], col).getElementsByClassName("piece");
            if (pieceInWay.length != 0) {
                if (pieceInWay[0].dataset.color == kingColor) {
                    break;
                } else if (["N", "P", "B"].includes(pieceInWay[0].dataset.type)) {
                    break;
                } else if (["Q", "R"].includes(pieceInWay[0].dataset.type)) {
                    return true;
                }
            }
        }

        for (let i = 0; i < downRow.length; i++) {
            let pieceInWay = getCell(downRow[i], col).getElementsByClassName("piece");
            if (pieceInWay.length != 0) {
                if (pieceInWay[0].dataset.color == kingColor) {
                    break;
                } else if (["N", "P", "B"].includes(pieceInWay[0].dataset.type)) {
                    break;
                } else if (["Q", "R"].includes(pieceInWay[0].dataset.type)) {
                    return true;
                }
            }
        }

        // check quadrant 1 for Bishop and Queen
        for (let i = 1; i < 8; i++) {
            let newCol = col + i;
            let newRow = row + i;
            if (newCol < 8 && newRow < 8) {
                if (getCell(newRow, newCol).getElementsByClassName("piece").length != 0) {
                    let pieceInWay = getCell(newRow, newCol).getElementsByClassName("piece");
                    if (pieceInWay[0].dataset.color == kingColor) {
                        break;
                    } else if (["N", "P", "R"].includes(pieceInWay[0].dataset.type)) {
                        break;
                    } else if (["Q", "B"].includes(pieceInWay[0].dataset.type)) {
                        return true;
                    }
                }
            } else {
                break;
            }
        }

        for (let i = 1; i < 8; i++) {
            let newCol = col + i;
            let newRow = row - i;
            if (newCol < 8 && newRow >= 0) {
                if (getCell(newRow, newCol).getElementsByClassName("piece").length != 0) {
                    let pieceInWay = getCell(newRow, newCol).getElementsByClassName("piece");
                    if (pieceInWay[0].dataset.color == kingColor) {
                        break;
                    } else if (["N", "P", "R"].includes(pieceInWay[0].dataset.type)) {
                        break;
                    } else if (["Q", "B"].includes(pieceInWay[0].dataset.type)) {
                        return true;
                    }
                }
            } else {
                break;
            }
        }

        for (let i = 1; i < 8; i++) {
            let newCol = col - i;
            let newRow = row + i;
            if (newCol >= 0 && newRow < 8) {
                if (getCell(newRow, newCol).getElementsByClassName("piece").length != 0) {
                    let pieceInWay = getCell(newRow, newCol).getElementsByClassName("piece");
                    if (pieceInWay[0].dataset.color == kingColor) {
                        break;
                    } else if (["N", "P", "R"].includes(pieceInWay[0].dataset.type)) {
                        break;
                    } else if (["Q", "B"].includes(pieceInWay[0].dataset.type)) {
                        return true;
                    }
                }
            } else {
                break;
            }
        }

        for (let i = 1; i < 8; i++) {
            let newCol = col - i;
            let newRow = row - i;
            if (newCol >= 0 && newRow >= 0) {
                if (getCell(newRow, newCol).getElementsByClassName("piece").length != 0) {
                    let pieceInWay = getCell(newRow, newCol).getElementsByClassName("piece");
                    if (pieceInWay[0].dataset.color == kingColor) {
                        break;
                    } else if (["N", "P", "R"].includes(pieceInWay[0].dataset.type)) {
                        break;
                    } else if (["Q", "B"].includes(pieceInWay[0].dataset.type)) {
                        return true;
                    }
                }
            } else {
                break;
            }
        }


        // check Pawn
        let moveRow = (kingColor == "W" ? 1 : -1);
        for (let value of [-1, 1]) {
            let newRow = row - moveRow;
            let newCol = col + value;
            if (range(0, 8).includes(newRow) && range(0, 8).includes(newCol)) {
                if (getCell(newRow, newCol).getElementsByClassName("piece").length != 0) {
                    let bePawn = getCell(newRow, newCol).getElementsByClassName("piece");
                    if (bePawn[0].dataset.type == "P" && bePawn[0].dataset.color != kingColor) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

}

let draggedPiece = null;
let prevDragOverCell = null;
let enpassantPosition = { row: null, col: null };
let fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function getCell(row, col) {
    return document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
}

function convertToChessNotation(row, col) {
    const newRow = 8 - row;
    const newCol = String.fromCharCode(col + 97);

    return newCol + newRow;
}
function convertToLongAlgebraicNotation(startRow, startCol, endRow, endCol) {
    const startChessNotation = convertToChessNotation(startRow, startCol);
    const endChessNotation = convertToChessNotation(endRow, endCol);
    const longAlgebraicNotation = startChessNotation + endChessNotation;

    return longAlgebraicNotation;
}

function convertFromChessNotation(chessNotation) {
    const col = chessNotation.charCodeAt(0) - 97;
    const row = 8 - parseInt(chessNotation.charAt(1));

    return { row, col };
}


function parseLongAlgebraicNotation(longAlgebraicNotation) {
    const start = longAlgebraicNotation.slice(0, 2);
    const end = longAlgebraicNotation.slice(2, 4);

    const { row: startRow, col: startCol } = convertFromChessNotation(start);
    const { row: endRow, col: endCol } = convertFromChessNotation(end);

    return {
        start: { row: startRow, col: startCol },
        end: { row: endRow, col: endCol }
    };
}

const pieces = [];
let turn = true;
document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");

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
        pieces.push(new Rook("B", 0, 0));
        pieces.push(new Knight("B", 0, 1));
        pieces.push(new Bishop("B", 0, 2));
        pieces.push(new Queen("B", 0, 3));
        pieces.push(new King("B", 0, 4));
        pieces.push(new Bishop("B", 0, 5));
        pieces.push(new Knight("B", 0, 6));
        pieces.push(new Rook("B", 0, 7));
        for (let i = 0; i < 8; i++) {
            pieces.push(new Pawn("B", 1, i));
        }

        pieces.push(new Rook("W", 7, 0));
        pieces.push(new Knight("W", 7, 1));
        pieces.push(new Bishop("W", 7, 2));
        pieces.push(new Queen("W", 7, 3));
        pieces.push(new King("W", 7, 4));
        pieces.push(new Bishop("W", 7, 5));
        pieces.push(new Knight("W", 7, 6));
        pieces.push(new Rook("W", 7, 7));
        for (let i = 0; i < 8; i++) {
            pieces.push(new Pawn("W", 6, i));
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
    }

    function handleDrop(event) {
        event.preventDefault();
        if (turn) {
            let moveFlag = false;
            const droppedRow = parseInt(this.dataset.row);
            const droppedCol = parseInt(this.dataset.col);
            const chessNotation = convertToLongAlgebraicNotation(draggedPiece.row, draggedPiece.col, droppedRow, droppedCol);

            if (draggedPiece && draggedPiece.canCaptureAt(droppedRow, droppedCol)) {
                const cell = getCell(droppedRow, droppedCol);
                const index = pieces.findIndex(piece => piece === draggedPiece);
                if (index !== -1) {
                    pieces.splice(index, 1);
                }
                cell.getElementsByClassName('piece')[0].remove();
                draggedPiece.moveTo(droppedRow, droppedCol);
                pieces.push(draggedPiece);
                cell.appendChild(draggedPiece.element);
                moveFlag = true;

            }
            if (draggedPiece && draggedPiece.canMoveTo(droppedRow, droppedCol)) {
                const index = pieces.findIndex(piece => piece === draggedPiece);
                if (index !== -1) {
                    pieces.splice(index, 1);
                }
                draggedPiece.moveTo(droppedRow, droppedCol);
                pieces.push(draggedPiece);
                this.appendChild(draggedPiece.element);
                moveFlag = true;
            }
            if (moveFlag) {
                turn = false;
                fetch("http://localhost:3000/botmove", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        move: chessNotation,
                        fen,
                    })
                })
                    .then((res) => res.json()
                        .then((data) => {
                            fen = data.fen;
                            let { start: startCell, end: endCell } = parseLongAlgebraicNotation(data.bestMove)
                            let botPiece = getCell(startCell.row, startCell.col).getElementsByClassName('piece')[0];
                            const index = pieces.findIndex(piece => piece.row === startCell.row && piece.col === startCell.col);
    
                            let botPieceInArray = pieces[index];
                            console.log(pieces[index]);
                            let newPiece;
                            switch (botPieceInArray.type) {
                                case "R":
                                    newPiece = new Rook(botPieceInArray.color, endCell.row, endCell.col);
                                    break;
                                case "N":
                                    newPiece = new Knight(botPieceInArray.color, endCell.row, endCell.col);
                                    break;
                                case "B":
                                    newPiece = new Bishop(botPieceInArray.color, endCell.row, endCell.col);
                                    break;
                                case "Q":
                                    newPiece = new Queen(botPieceInArray.color, endCell.row, endCell.col);
                                    break;
                                case "K":
                                    newPiece = new King(botPieceInArray.color, endCell.row, endCell.col);
                                    break;
                                case "P":
                                    newPiece = new Pawn(botPieceInArray.color, endCell.row, endCell.col);
                                    break;
                            }
                            if (index !== -1) {
                                pieces.splice(index, 1);
                            }
                            pieces.push(newPiece);
                            let botPieceNew = botPiece.cloneNode(true);
                            let endCellElement = getCell(endCell.row, endCell.col)
                            if (endCellElement.getElementsByClassName('piece')[0]) {
                                endCellElement.getElementsByClassName('piece')[0].remove();
                            }
                            endCellElement.appendChild(botPieceNew);
                            botPiece.remove();
                            console.log(pieces)
                            turn = true;
                        })
                    );
            }
    
        }
        draggedPiece = null;
        let cells = document.querySelectorAll(".moveable-icon");
        cells.forEach(cell => {
            cell.remove();
        });

        cells = document.querySelectorAll(".captureable-icon");
        cells.forEach(cell => {
            cell.remove();
        });

    }



    createBoard();
    initializePieces();
});

function range(start, end) {
    arr = []
    for (let i = start; i < end; i++) {
        arr.push(i);
    }
    return arr;
}
