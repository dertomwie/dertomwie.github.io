/**
 * Generates an nxn maze.
 * 
 * @param {int} n is the side-length of the generated maze.
 */
function generateMaze(n) {
    let maze = [];
    for (i = 0; i < n; i++) {
        maze[i] = [];
        for (j = 0; j < n; j++) {
            maze[i][j] = new MazeTile();
        }
    }
    return maze;
}

/**
 * This function makes a maze beatable.
 * 
 * @param {MazeTile[][]} maze that is improved
 */
function improveMaze(maze) {
    let n = maze.length;
    let startingTile = maze[n-1][Math.floor(n/2)];
    let endTile = maze[0][Math.floor(n/2)];
    
    /* let startOk = false;
    let startTileConnections = getConnections(startingTile.shape);
    let startTileRotation = startingTile.rotation;
    for (i=0; i<startTileConnections.length; i++) {
        if (applyRotation(startTileConnections[i], startTileRotation) == Direction.SOUTH) {
            startOk = true;
        }
    }
    if (!startOk) {
        startingTile.shape = TileShape.FULL_CROSS;
    } */

    let worklist = new Map();
    worklist.set(startingTile, [Direction.SOUTH]);
    let visited = new Map();
    while (!visited.has(endTile)) {
        //TODO: forEach e in worklist: if reachable from one of saved directions, add all reachable from that tile to worklist and e to visited
    }
}

/**
 * This class represents tiles in the maze based on their connection points
 * and their rotation.
 */
class MazeTile {
    constructor() {
        let tile = Math.random();

        if (tile < 0.2) {
            //20% chance for a straight
            this.shape = TileShape.STRAIGHT;
        } else if (tile < 0.45) {
            // 25% chance for a 4-way crossing
            this.shape = TileShape.FULL_CROSS;
        } else if (tile < 0.75) {
            //30% chance for a 3-way crossing
            this.shape = TileShape.T_CROSS;
        } else {
            //25% chance for a turn
            this.shape = TileShape.TURN;
        }

        this.rotation = Math.floor((Math.random() * 4));
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
 * @returns connections as an array of `Direction`s.
 */
function getConnections(tileShape) {
    switch (tileShape) {
        case TileShape.STRAIGHT :
            return [Direction.SOUTH, Direction.NORTH];
        case TileShape.TURN :
            return [Direction.SOUTH, Direction.WEST];
        case TileShape.T_CROSS :
            return [Direction.SOUTH, Direction.WEST, Direction.EAST];
        case TileShape.FULL_CROSS :
            return [Direction.SOUTH, Direction.WEST, Direction.NORTH, Direction.EAST];
        default:
            return [Direction.SOUTH];
    }
}
