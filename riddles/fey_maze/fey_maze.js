/**
 * Save player(s) position(s) and near past.
 */
let playerState;

/**
 * Maze of this website.
 */
let maze;

/**
 * Counts moves during a maze completion.
 */
let movecounter = 0;

//Add key listeners to maze movement buttons
addKeyListener("w", document.getElementById("fw-button"));
addKeyListener("a", document.getElementById("l-button"));
addKeyListener("s", document.getElementById("bw-button"));
addKeyListener("d", document.getElementById("r-button"));
let activeButtons = new Set();

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

function victory() {
    document.getElementById("victory").innerText = "You got to the exit of the maze! Bravo!\nYou took " + movecounter + " moves. Pretty swift!";
}

/**
 * Creates a fresh player state and maze.
 */
function drawNewMaze() {
    //potentially clean up from previous victory
    document.getElementById("victory").innerText = "";
    movecounter = 0;
    
    let n = parseInt(document.getElementById("mazesize").value, 10);
    if(isNaN(n)) {
        //document.getElementById("mazesize").innerText = "";
        document.getElementById("debug").innerText = "No number was given for the size of the maze. Insert your favorited size above the generation button.";
        n = 7;
    }
    if(n > 31) {
        document.getElementById("debug").innerText = "This website doesn't support mazes larger than 31.";
        n = 31
    }

    generatePlayerState(n);

    generateMaze(n);

    drawMaze();
}

/**
 * This function draws the maze in the maze html div of this site.
 */
function drawMaze() {
    document.getElementById("maze").innerHTML = "";
    
    let innerMazeContainer = document.createElement("div");
    innerMazeContainer.id = "inner-maze-container";
    innerMazeContainer.classList.add("maze-container");

    let n = maze.length;

    //fill the inner maze container
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

        innerMazeContainer.appendChild(htmlColumn);
    }
    
    //fill the outer maze container
    //TODO: This should be its own function and not redrawn every time.
    let outerMazeContainer = document.getElementById("maze");
    
    let offsetForEvenN = ((n+1)%2)*3;
    
    let sideLeft = document.createElement("div");
    sideLeft.id = "left-maze-wall";
    sideLeft.classList.add("maze-side-wall");
    sideLeft.style.width = (1/(n*3+2) * 100) + "%";
    
    let sideRight = document.createElement("div");
    sideRight.id = "right-maze-wall";
    sideRight.classList.add("maze-side-wall");
    sideRight.style.width = (1/(n*3+2) * 100) + "%";
    
    let middleDiv = document.createElement("div");
    middleDiv.id = "middle-div";
    middleDiv.classList.add("middle-div");
    middleDiv.style.width = ((n*3)/(n*3+2) * 100) + "%";
    
    let upperWall = document.createElement("div");
    upperWall.id = "upper-maze-wall";
    upperWall.classList.add("maze-wall-container");
    upperWall.style.height = (1/(n*3+2) * 100) + "%";
    let wall0 = document.createElement("div");
    wall0.classList.add("wall-piece");
    wall0.style.width = ((n*3-1+offsetForEvenN)/(n*6) * 100) + "%";
    let passage0 = document.createElement("div");
    passage0.classList.add("passage");
    passage0.style.width = (1/(n*3) * 100) + "%";
    let wall1 = document.createElement("div");
    wall1.classList.add("wall-piece");
    wall1.style.width = ((n*3-1-offsetForEvenN)/(n*6) * 100) + "%";
    
    upperWall.appendChild(wall0);
    upperWall.appendChild(passage0);
    upperWall.appendChild(wall1);
    
    let lowerWall = document.createElement("div");
    lowerWall.id = "upper-maze-wall";
    lowerWall.classList.add("maze-wall-container");
    lowerWall.style.height = (1/(n*3+2) * 100) + "%";
    let wall2 = document.createElement("div");
    wall2.classList.add("wall-piece");
    wall2.style.width = ((n*3-1+offsetForEvenN)/(n*6) * 100) + "%";
    let passage1 = document.createElement("div");
    passage1.classList.add("passage");
    passage1.style.width = (1/(n*3) * 100) + "%";
    let wall3 = document.createElement("div");
    wall3.classList.add("wall-piece");
    wall3.style.width = ((n*3-1-offsetForEvenN)/(n*6) * 100) + "%";
    
    lowerWall.appendChild(wall2);
    lowerWall.appendChild(passage1);
    lowerWall.appendChild(wall3);
    
    middleDiv.appendChild(upperWall);
    middleDiv.appendChild(innerMazeContainer);
    middleDiv.appendChild(lowerWall);
    
    outerMazeContainer.appendChild(sideLeft);
    outerMazeContainer.appendChild(middleDiv);
    outerMazeContainer.appendChild(sideRight);

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
    let entryPoints = tile.getEntryPoints();

    //use colors based on the tile shape and whether the party is on it
    //these indices correspond to the directions, SOUTH is 7, WEST 3, etc.
    let indices = [7, 3, 1, 5];
    for (let i=0; i<4; i++) {
        //check whether there is a path in this direction
        if (entryPoints.has(i)) {
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
        colors[4] = "Pink";
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
 * This function activates buttons, so the player(s) can move around.
 */
function generateButtons() {
    let x = playerState.getX();
    let y = playerState.getY();
    let tile = maze[y][x];
    let eP = tile.getEntryPoints();
    let rot = tile.getRotation();
    
    //turn all buttons invisible
    document.getElementById("fw-button").style.visibility = "hidden";
    document.getElementById("l-button").style.visibility = "hidden";
    document.getElementById("bw-button").style.visibility = "hidden";
    document.getElementById("r-button").style.visibility = "hidden";
    activeButtons = new Set();
    for (let exit of eP) {
        //determine how the player witnesses the exit options:
        let relative = (4 + exit - playerState.getFrom()) % 4;

        let resultingDirection = exit;

        let button;
        switch (relative) {
            case 0:
                button = document.getElementById("bw-button");
                button.style.visibility = "visible";
                break;
            case 1:
                button = document.getElementById("l-button");
                button.style.visibility = "visible";
                break;
            case 2:
                button = document.getElementById("fw-button");
                button.style.visibility = "visible";
                break;
            case 3:
                button = document.getElementById("r-button");
                button.style.visibility = "visible";
                break;
        }
        
        button.onclick = () => move(resultingDirection);
        activeButtons.add(button);
    }
}

/**
 * This function creates a key listener on the page for a specific button, which is then executed.
 */
function addKeyListener(key, button) {
    document.addEventListener("keyup", (event) => {
        if (event.key == key && activeButtons.has(button)) {
            button.click();
        }
    });
}

/**
 * Moves the player on the path in the given direction.
 * 
 * @param {Direction} direction Direction of the taken path.
 */
function move(direction) {
    movecounter += 1;
    let n = maze.length;
    let x = playerState.getX();
    let y = playerState.getY();
    let tile = maze[y][x];
    let rEP = tile.getEntryPoints();

    if (!rEP.has(direction)) {  //this can never happen
        //if there is no path in the given direction, we cannot go there
        document.getElementById("debug").innerText = "You could not move in direction " + direction + ", since there is no path there.";
        return;
    }

    // find the least positive rotation, such that there is a walkable path in that direction
outer:
    for (let rotation=1; rotation<5; rotation++) {
        let consideredTile;
        let entries;
        switch (applyRotation(direction, rotation)) {
            case Direction.SOUTH :
                //check whether the maze ends in this direction
                if (y > n-2) {
                    break;
                }

                //if not, check if there is a path
                consideredTile = maze[y+1][x];
                entries = consideredTile.getEntryPoints();
                if (!entries.has(Direction.NORTH)) {
                    break;
                }

                //if there is a path, take it
                tile.rotate(rotation);
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
                entries = consideredTile.getEntryPoints();
                if (!entries.has(Direction.EAST)) {
                    break;
                }

                //if there is a path, take it
                tile.rotate(rotation);
                playerState.setX(x-1);
                playerState.setFrom(Direction.EAST);
                break outer;
            case Direction.NORTH :
                //check whether the maze ends in this direction
                if (y < 1) {
                    if (x == Math.floor(n/2)) {
                        //win condition
                        victory();
                        tile.rotate(rotation);
                        playerState.setFrom(Direction.NORTH);
                        break outer;
                    }
                    break;
                }

                //if not, check if there is a path
                consideredTile = maze[y-1][x];
                entries = consideredTile.getEntryPoints();
                if (!entries.has(Direction.SOUTH)) {
                    break;
                }

                //if there is a path, take it
                tile.rotate(rotation);
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
                entries = consideredTile.getEntryPoints();
                if (!entries.has(Direction.WEST)) {
                    break;
                }

                //if there is a path, take it
                tile.rotate(rotation);
                playerState.setX(x+1);
                playerState.setFrom(Direction.WEST);
                break outer;
            default:
                break;
        }
    }

    //redraw
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

function makeItemVisible(item) {
    let s = "" + item;
    let htmlItem = document.getElementById(s);
    htmlItem.style.visibility = "visible";
}

function reveal1() {
    makeItemVisible("hint1");
}

function reveal2() {
    makeItemVisible("hint2");
}

function reveal3() {
    makeItemVisible("hint3");
}

function revealA() {
    makeItemVisible("advice");
}

