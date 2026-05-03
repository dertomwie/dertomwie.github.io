/**
 * This function draws the maze in the maze html div of this site.
 */
function drawMaze() {
    let n = 7; //TODO: make this adjustable

    let maze = generateMaze(n);

    for (let y=0; y<n; y++) {
        let mazeRow = maze[y];
        
        let htmlRow = document.createElement("div");
        htmlRow.id = "row" + y;
        htmlRow.classList.add("row");
        htmlRow.style.flex = (100/n) + "%";
        htmlRow.style.backgroundColor = "LightGray";

        for (let x=0; x<n; x++) {
            let mazeTile = mazeRow[x];

            let htmlTile = drawTile(mazeTile, x == n-1 && y == Math.floor(n/2), Direction.SOUTH);

            htmlRow.appendChild(htmlTile);
        }

        document.getElementById("maze").appendChild(htmlRow);
    }
}

/**
 * This function generates the visual representation of a MazeTile as an HTML element.
 * 
 * @param {MazeTile} tile that will be represented
 * @param {boolean} current whether the party is currently on this field
 * @param {Direction} from if current, this is the direction they came from
 * @returns HTML representation of the tile.
 */
function drawTile(tile, current, from) {
    let htmlTile = document.createElement("div");

    htmlTile.classList.add("grid-container");

    let colors = new Array(9);
    colors[0] = "Green";
    colors[2] = "Green";
    colors[6] = "Green";
    colors[8] = "Green";

    let correction = (4-tile.getRotation()) % 4;
    let entryPoints = tile.getEntryPoints();
    entryPoints.forEach((dir) => applyRotation(dir, correction));

    //use colors based on the tile shape and whether the party is on it

    if (entryPoints.has(Direction.NORTH)) {
        // NORTH is a path
        if (current && from == Direction.NORTH) {
            colors[1] = "Blue";
        } else {
            colors[1] = "White";
        }
    } else {
            colors[1] = "Green";
    }
    if (entryPoints.has(Direction.EAST)) {
        // EAST is a path
        if (current && from == Direction.EAST) {
            colors[5] = "Blue";
        } else {
            colors[5] = "White";
        }
    } else {
            colors[5] = "Green";
    }
    if (entryPoints.has(Direction.SOUTH)) {
        // SOUTH is a path
        if (current && from == Direction.SOUTH) {
            colors[7] = "Blue";
        } else {
            colors[7] = "White";
        }
    } else {
            colors[7] = "Green";
    }
    if (entryPoints.has(Direction.WEST)) {
        // WEST is a path
        if (current && from == Direction.WEST) {
            colors[3] = "Blue";
        } else {
            colors[3] = "White";
        }
    } else {
            colors[3] = "Green";
    }
    if (current) {
        colors[4] = "Blue";
    } else {
        colors[4] = "White";
    }

    document.getElementById("debug").innerText += colors + "\n";

    //create subtiles to represent this tile
    for (let i = 0; i<9; i++) {
        let square = document.createElement("div");
        square.classList.add("square");
        square.style.backgroundColor = colors[i];
        htmlTile.appendChild(square);
    }

    htmlTile.style.rotate = (90 * tile.getRotation()) + "deg";

    return htmlTile;
}

/**
 * Generates an nxn maze.
 * 
 * @param {int} n is the side-length of the generated maze.
 */
function generateMaze(n) {
    let maze = [];
    for (let i = 0; i < n; i++) {
        maze[i] = [];
        for (j = 0; j < n; j++) {
            maze[i][j] = new MazeTile();
        }
    }

    improveMaze(maze);

    return maze;
}

/**
 * This function makes a maze beatable.
 * 
 * @param {MazeTile[][]} maze that is improved
 */
function improveMaze(maze) {
    let n = maze.length;
    let middle = Math.floor(n / 2);

    // we will explore reachable tiles until we find the exit tile.
    let worklist = new Set();
    // to this end, we start with the entry tile from the south.
    worklist.add([n - 1, middle, Direction.SOUTH]);
    let visited = new Set();
    while (true) {
        let change = false;

        let nextWorklist = new Set();

        // go through tiles on worklist
        for (let e of worklist.values()) {
            let x = e[1];
            let y = e[0];
            let dir = e[2];
            let tile = maze[y][x];
            let entryPoints = tile.getEntryPoints();

            // if the tile can be entered from the given direction, mark as visited
            if (entryPoints.has(dir)) {
                visited.add(x + n*y);
                if (y == 0 && x == middle) {
                    return;
                }
                change = true;

                // Add all surrounding tiles to worklist.
                // Each surrounding tile can be reached from this tile by rotating.
                if (y < n - 1 && !visited.has(x + (y + 1)*n)) {
                    nextWorklist.add([y+1, x, Direction.NORTH]);
                }
                if (x > 0 && !visited.has(x - 1 + y*n)) {
                    nextWorklist.add([y, x - 1, Direction.EAST]);
                }
                if (y > 0 && !visited.has(x + (y - 1)*n)) {
                    nextWorklist.add([y - 1, x, Direction.SOUTH]);
                }
                if (x < n - 1 && !visited.has(x + 1 + y*n)) {
                    nextWorklist.add([y, x + 1, Direction.WEST]);
                }
            } else {
                if (!visited.has(x + y*n)) {
                    nextWorklist.add(e);
                }
            }
        }

        worklist = nextWorklist;
        
        // if nothing changed, rotate all tiles in worklist by 90° clockwise.
        if (!change) {
            worklist.forEach((arr) => maze[arr[0]][arr[1]].rotate(1));
        }
    }
}

/**
 * This class represents tiles in the maze based on their connection points
 * and their rotation.
 */
class MazeTile {
    constructor() {
        let tile = Math.random();

        if (tile < 0.25) {
            //25% chance for a straight
            this.shape = TileShape.STRAIGHT;
        } else if (tile < 0.4) {
            // 15% chance for a 4-way crossing
            this.shape = TileShape.FULL_CROSS;
        } else if (tile < 0.7) {
            //30% chance for a 3-way crossing
            this.shape = TileShape.T_CROSS;
        } else {
            //30% chance for a turn
            this.shape = TileShape.TURN;
        }

        this.rotation = Math.floor((Math.random() * 4));
    }

    toString() {
        return "Tile: " + this.shape +", rotation: " + this.rotation;
    }

    /**
     * Method to retrieve all directions from which this tile can be entered.
     * 
     * @returns the correctly rotated entry points of the tile
     */
    getEntryPoints() {
        let connections = getConnections(this.shape);

        let entryPoints = new Set();

        for (let d of connections) {
            entryPoints.add(applyRotation(d, this.rotation));
        }

        return entryPoints;
    }

    getRotation() {
        return this.rotation;
    }

    /**
     * Rotates this tile clockwise by the given amount.
     * 
     * @param {int} n amount of 90° clockwise rotations
     */
    rotate(n) {
        let newRotation = (this.rotation + n) % 4;
        if (newRotation < 0) {
            this.rotation = 4 + newRotation;
        } else {
            this.rotation = newRotation;
        }
    }
}

/**
 * Used as an enum for directions in the maze.
 */
const Direction = {
    SOUTH: 0,
    WEST: 1,
    NORTH: 2,
    EAST: 3
};

/**
 * Calculates a direction on a rotated tile.
 * 
 * @param {Direction} direction unrotated direction
 * @param {int} rotation applied rotation
 * @returns the actual direction after applying the rotation.
 */
function applyRotation(direction, rotation) {
    return (direction + rotation) % 4;
}

/**
 * Used as an enum for tile shapes.
 */
const TileShape = {
    STRAIGHT: "straight",
    TURN: "turn",
    T_CROSS: "t cross",
    FULL_CROSS: "full cross"
};

/**
 * Returns the connections of a given unrotated TileShape.
 * 
 * @param {TileShape} tileShape in question
 * @returns connections as a set of `Direction`s.
 */
function getConnections(tileShape) {
    switch (tileShape) {
        case TileShape.STRAIGHT:
            return new Set([Direction.SOUTH, Direction.NORTH]);
        case TileShape.TURN:
            return new Set([Direction.SOUTH, Direction.WEST]);
        case TileShape.T_CROSS:
            return new Set([Direction.SOUTH, Direction.WEST, Direction.EAST]);
        case TileShape.FULL_CROSS:
            return new Set([Direction.SOUTH, Direction.WEST, Direction.NORTH, Direction.EAST]);
        default:
            return new Set([Direction.SOUTH]);
    }
}
