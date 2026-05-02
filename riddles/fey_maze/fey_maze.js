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
    let visited = new Map();
    while (true) {
        let change = false;

        // go through tiles on worklist
        for (e of worklist.values()) {
            let x = e[1];
            let y = e[0];
            let dir = e[2];
            let tile = maze[y][x];
            let entryPoints = tile.getEntryPoints();

            // if the tile can be entered from the given direction, mark as visited
            if (entryPoints.has(dir)) {
                visited.add([x, y]);
                if (y == 0 && x == middle) {
                    return;
                }
                change = true;
                
                worklist.delete([y, x, dir]);

                // Add all surrounding tiles to worklist.
                // Each surrounding tile can be reached from this tile by rotating.
                if (y < n - 1 && !visited.has([x, y + 1])) {
                    worklist.add([x, y + 1, Direction.NORTH]);
                }
                if (x > 0 && !visited.has([x - 1, y])) {
                    worklist.add([x - 1, y, Direction.EAST]);
                }
                if (y > 0 && !visited.has([x, y - 1])) {
                    worklist.add([x, y - 1, Direction.SOUTH]);
                }
                if (x < n - 1 && !visited.has([x + 1, y])) {
                    worklist.add([x + 1, y, Direction.WEST]);
                }
            }
        }
        
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

    /**
     * Method to retrieve all directions from which this tile can be entered.
     * 
     * @returns the correctly rotated entry points of the tile
     */
    getEntryPoints() {
        let connections = getConnections(this.shape);

        let entryPoints = new Set();

        for (d of connections) {
            entryPoints.add(applyRotation(d, this.rotation));
        }

        return entryPoints;
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
