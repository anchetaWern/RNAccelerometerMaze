import { Dimensions } from 'react-native';
import Matter from 'matter-js';

import GetRandomNumber from './GetRandomNumber';

const { height, width } = Dimensions.get('window');

const TOP = 'T';
const BOTTOM = 'B';
const RIGHT = 'R';
const LEFT = 'L';

const directionX = {
  'T': 0, 
  'B': 0,
  'R': 1,
  'L': -1
};

const directionY = {
  'T': -1,
  'B': 1,
  'R': 0,
  'L': 0
};

const op = {
  'T': BOTTOM, 
  'B': TOP,
  'R': LEFT,
  'L': RIGHT
};

function CreateMaze(gridX, gridY){

  const mapWidth = gridX; 
  const mapHeight = gridY; 

  const blockWidth = Math.floor(width / mapWidth);
  const blockHeight = Math.floor(height / mapHeight);

  let grid = new Array(mapHeight)
  for (var i = 0; i < grid.length; i++) {
    grid[i] = new Array(mapWidth);
  }

  const wallOpts = {
    isStatic: true,
  };

  const matter = Matter.Composite.create(wallOpts);

  const getDirectionX = (dir) => {
    return directionX[dir];
  }

  const getDirectionY = (dir) => {
    return directionY[dir];
  }

  const getOpposite = (dir) => {
    return op[dir];
  }

  const getPointInDirection = (x, y, dir) => {
    const newXPoint = x + getDirectionX(dir);
    const newYPoint = y + getDirectionY(dir);

    if (newXPoint < 0 || newXPoint >= mapWidth) {
      return;
    }
    
    if (newYPoint < 0 || newYPoint >= mapHeight) {
      return;
    }

    return grid[newYPoint][newXPoint];
  }

  const generateWall = (x, y) => {
    const walls = Matter.Composite.create({ isStatic: true });
    const gridPoint = grid[y][x];
    const opts = { 
      isStatic: true,
      label: 'wall'
    };

    const wallThickness = 5;

    const topPoint = getPointInDirection(x, y, TOP);
    if (gridPoint !== TOP && topPoint !== getOpposite(TOP)) {
      Matter.Composite.add(walls, Matter.Bodies.rectangle(blockWidth / 2, 0, blockWidth, wallThickness, opts));
    }
    const bottomPoint = getPointInDirection(x, y, BOTTOM);
    if (gridPoint !== BOTTOM && bottomPoint !== getOpposite(BOTTOM)) {
      Matter.Composite.add(walls, Matter.Bodies.rectangle(blockWidth / 2, blockHeight, blockWidth, wallThickness, opts));
    }
    const leftPoint = getPointInDirection(x, y, LEFT);
    if (gridPoint !== LEFT && leftPoint !== getOpposite(LEFT)) {
      Matter.Composite.add(walls, Matter.Bodies.rectangle(0, blockHeight / 2, wallThickness, blockHeight + wallThickness, opts));
    }
    const rightPoint = getPointInDirection(x, y, RIGHT);
    if (gridPoint !== RIGHT && rightPoint !== getOpposite(RIGHT)) {
      Matter.Composite.add(walls, Matter.Bodies.rectangle(blockWidth, blockHeight / 2, wallThickness, blockHeight + wallThickness, opts));
    }
    
    const translate = Matter.Vector.create(x * blockWidth, y * blockHeight);
    Matter.Composite.translate(walls, translate);
    return walls;
  }


  const carvePathFrom = (x, y, grid) => {
   
    const directions = [TOP, BOTTOM, RIGHT, LEFT]
      .sort(f => 0.5 - GetRandomNumber()); 

    directions.forEach(dir => {
      const nX = x + getDirectionX(dir);
      const nY = y + getDirectionY(dir);
      const xNeighborOK = nX >= 0 && nX < mapWidth;
      const yNeighborOK = nY >= 0 && nY < mapHeight;
      

      if (xNeighborOK && yNeighborOK && grid[nY][nX] == undefined) {
        grid[y][x] = grid[y][x] || dir;
        grid[nY][nX] = grid[nY][nX] || getOpposite(dir);
        carvePathFrom(nX, nY, grid);
      }
    }); 
  }

  
  carvePathFrom(0, 0, grid);

  for (var i = 0; i < grid.length; i++) {
    for (var j = 0; j < grid[i].length; j++) {
      Matter.Composite.add(matter, generateWall(j, i));
    }
  }


  return matter;
 
  
}

export default CreateMaze;