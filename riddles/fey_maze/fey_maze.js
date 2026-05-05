/**
 * Save player(s) position(s) and near past.
 */
let playerState;

/**
 * Maze of this website.
 */
let maze;

/**
 * Class to represent the state of a player.
 * 
 * Saves the horizontal position as x, the vertical position as y and the direction from which the player entered the current tile.
 */
class PlayerState {
    constructor(x, y, from) {
        this.x = x;
        this.y = y;
        this.from = from;
    }

    getX() {
        return this.x;
    }

    setX(val) {
        this.x = val;
    }

    getY() {
        return this.y;
    }

    setY(val) {
        this.y = val;
    }

    getFrom() {
        return this.from;
    }

    setFrom(val) {
        this.from = val;
    }
}

/**
 * Sets the player state to the starting position in the maze.
 * 
 * @param {int} n side length of the maze.
 */
function generatePlayerState(n) {
    playerState = new PlayerState(Math.floor(n/2), n-1, Direction.SOUTH);
}

/**
 * Creates a fresh player state and maze.
 */
function drawNewMaze() {
    let n = 7; //TODO: make this adjustable

    generatePlayerState(n);

    generateMaze(n);

    drawMaze();
}

/**
 * This function draws the maze in the maze html div of this site.
 */
function drawMaze() {
    document.getElementById("maze").innerHTML = "";

    let n = maze.length;

    for (let x=0; x<n; x++) {
        let htmlColumn = document.createElement("div");
        htmlColumn.id = "column-" + x;
        htmlColumn.classList.add("column");
        htmlColumn.style.flex = (100/n) + "%";
        htmlColumn.style.backgroundColor = "LightGray";

        for (let y=0; y<n; y++) {
            let htmlTile = drawTile(x, y);

            htmlColumn.appendChild(htmlTile);
        }

        document.getElementById("maze").appendChild(htmlColumn);
    }

    generateButtons();
}

/**
 * This function generates the visual representation of a MazeTile as an HTML element.
 * 
 * @param {MazeTile} tile that will be represented
 * @param {boolean} current whether the party is currently on this field
 * @param {Direction} from if current, this is the direction they came from
 * @returns HTML representation of the tile.
 */
function drawTile(x, y) {
    let current = x == playerState.getX() && y == playerState.getY();

    let htmlTile = document.createElement("div");

    htmlTile.classList.add("grid-container");

    let colors = new Array(9);
    colors[0] = "Green";
    colors[2] = "Green";
    colors[6] = "Green";
    colors[8] = "Green";

    let tile = maze[y][x];
    let rEntryPoints = new Set();
    tile.getEntryPoints().forEach((dir) => rEntryPoints.add(applyRotation(dir, tile.getRotation())));

    //use colors based on the tile shape and whether the party is on it
    //these indices correspond to the directions, SOUTH is 7, WEST 3, etc.
    let indices = [7, 3, 1, 5];
    for (let i=0; i<4; i++) {
        //check whether there is a path in this direction
        if (rEntryPoints.has(i)) {
            //if so, determine whether the player came from that path
            if (current && playerState.getFrom() == i) {
                colors[indices[i]] = "Blue";
            } else {
                colors[indices[i]] = "White";
            }
        } else {
            colors[indices[i]] = "Green";
        }
    }
    
    //color middle tile depending on whether the player is on it or not
    if (current) {
        colors[4] = "Blue";
    } else {
        colors[4] = "White";
    }

    //create subtiles to represent this tile
    for (let i = 0; i<9; i++) {
        let square = document.createElement("div");
        square.classList.add("square");
        square.style.backgroundColor = colors[i];
        htmlTile.appendChild(square);
    }

    //htmlTile.style.rotate = (90 * tile.getRotation()) + "deg";

    return htmlTile;
}

/**
 * This function generates buttons, so the player(s) can move around.
 */
function generateButtons() {
    let x = playerState.getX();
    let y = playerState.getY();
    let tile = maze[y][x];
    let eP = tile.getEntryPoints();
    let rot = tile.getRotation();

    let buttonContainer = document.getElementById("buttonContainer");
    buttonContainer.innerHTML = "";
    for (let exit of eP) {
        //determine how the player witnesses the exit options:
        let relative = (4 + applyRotation(exit, rot) - playerState.getFrom()) % 4;

        let resultingDirection = applyRotation(exit, rot);

        let button = document.createElement("button");
        button.type = "button";
        button.onclick = () => move(resultingDirection);
        switch (relative) {
            case 0:
                button.innerText = "Turn around.";
                break;
            case 1:
                button.innerText = "Turn left.";
                break;
            case 2:
                button.innerText = "Go forwards.";
                break;
            case 3:
                button.innerText = "Turn right.";
                break;
        }
        buttonContainer.appendChild(button);
    }
}

/**
 * Moves the player on the path in the given direction.
 * 
 * @param {Direction} direction Direction of the taken path.
 */
function move(direction) {
    let n = maze.length;
    let x = playerState.getX();
    let y = playerState.getY();
    let tile = maze[y][x];
    let rEP = new Set();
    tile.getEntryPoints().forEach((d) => rEP.add(applyRotation(d, tile.getRotation())));

    if (!rEP.has(direction)) {
        //if there is no path in the given direction, we cannot go there
        document.getElementById("debug").innerText = "You could not move in direction " + direction + ", since there is no path there.";
        return;
    }

    let rotateAmount = 0;

    // find the least positive rotation, such that there is a walkable path in that direction
outer:
    for (let rotation=1; rotation<5; rotation++) {
        let consideredTile;
        let entries = new Set();
        switch (applyRotation(direction, rotation)) {
            case Direction.SOUTH :
                //check whether the maze ends in this direction
                if (y > n-2) {
                    break;
                }

                //if not, check if there is a path
                consideredTile = maze[y+1][x];
                consideredTile.getEntryPoints().forEach((d) => entries.add(applyRotation(d, consideredTile.getRotation())));
                if (!entries.has(Direction.NORTH)) {
                    break;
                }

                //if there is a path, take it
                rotateAmount = rotation;
                playerState.setY(y+1);
                playerState.setFrom(Direction.NORTH);
                break outer;
            case Direction.WEST :
                //check whether the maze ends in this direction
                if (x < 1) {
                    break;
                }

                //if not, check if there is a path
                consideredTile = maze[y][x-1];
                consideredTile.getEntryPoints().forEach((d) => entries.add(applyRotation(d, consideredTile.getRotation())));
                if (!entries.has(Direction.EAST)) {
                    break;
                }

                //if there is a path, take it
                rotateAmount = rotation;
                playerState.setX(x-1);
                playerState.setFrom(Direction.EAST);
                break outer;
            case Direction.NORTH :
                //check whether the maze ends in this direction
                if (y < 1) {
                    break;
                }

                //if not, check if there is a path
                consideredTile = maze[y-1][x];
                consideredTile.getEntryPoints().forEach((d) => entries.add(applyRotation(d, consideredTile.getRotation())));
                if (!entries.has(Direction.SOUTH)) {
                    break;
                }

                //if there is a path, take it
                rotateAmount = rotation;
                playerState.setY(y-1);
                playerState.setFrom(Direction.SOUTH);
                break outer;
            case Direction.EAST :
                //check whether the maze ends in this direction
                if (x > n-2) {
                    break;
                }

                //if not, check if there is a path
                consideredTile = maze[y][x+1];
                consideredTile.getEntryPoints().forEach((d) => entries.add(applyRotation(d, consideredTile.getRotation())));
                if (!entries.has(Direction.WEST)) {
                    break;
                }

                //if there is a path, take it
                rotateAmount = rotation;
                playerState.setX(x+1);
                playerState.setFrom(Direction.WEST);
                break outer;
            default:
                break;
        }
    }

    //apply rotation to this tile and redraw
    tile.rotate(rotateAmount);
    drawMaze();
}

/**
 * Generates an nxn maze.
 * 
 * @param {int} n is the side-length of the generated maze.
 */
function generateMaze(n) {
    maze = [];
    for (let i = 0; i < n; i++) {
        maze[i] = [];
        for (j = 0; j < n; j++) {
            maze[i][j] = new MazeTile();
        }
    }

    improveMaze();
}

/**
 * This function makes a maze beatable.
 */
function improveMaze() {
    let n = maze.length;
    let middle = Math.floor(n / 2);

    // we will explore reachable tiles until we find the exit tile.
    let worklist = new Set();
    // to this end, we start with the entry tile from the south.
    worklist.add([playerState.getX(), playerState.getY(), playerState.getFrom()]);
    let visited = new Set();
    while (true) {
        let change = false;

        let nextWorklist = new Set();

        // go through tiles on worklist
        for (let e of worklist.values()) {
            let x = e[0];
            let y = e[1];
            let dir = e[2];
            let tile = maze[y][x];
            let rEntryPoints = new Set();
            tile.getEntryPoints().forEach((d) => rEntryPoints.add(applyRotation(d, tile.getRotation())));

            // if the tile can be entered from the given direction, mark as visited
            if (rEntryPoints.has(dir)) {
                visited.add(x + n*y);
                if (y == 0 && x == middle) {
                    return;
                }
                change = true;

                // Add all surrounding tiles to worklist.
                // Each surrounding tile can be reached from this tile by rotating.
                if (y < n - 1 && !visited.has(x + (y + 1)*n)) {
                    nextWorklist.add([x, y+1, Direction.NORTH]);
                }
                if (x > 0 && !visited.has(x - 1 + y*n)) {
                    nextWorklist.add([x - 1, y, Direction.EAST]);
                }
                if (y > 0 && !visited.has(x + (y - 1)*n)) {
                    nextWorklist.add([x, y - 1, Direction.SOUTH]);
                }
                if (x < n - 1 && !visited.has(x + 1 + y*n)) {
                    nextWorklist.add([x + 1, y, Direction.WEST]);
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
            worklist.forEach((arr) => maze[arr[1]][arr[0]].rotate(1));
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
