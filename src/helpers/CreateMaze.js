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

const CreateMaze = (gridX, gridY) => {

  this.width = gridX; 
  this.height = gridY; 

  this.blockWidth = Math.floor(width / this.width);
  this.blockHeight = Math.floor(height / this.height);

  this.grid = new Array(this.height)
  for (var i = 0; i < this.grid.length; i++) {
    this.grid[i] = new Array(this.width);
  }

  const wallOpts = {
    isStatic: true,
  };

  this.matter = Matter.Composite.create(wallOpts);

  getDirectionX = (dir) => {
    return directionX[dir];
  }

  getDirectionY = (dir) => {
    return directionY[dir];
  }

  getOpposite = (dir) => {
    return op[dir];
  }

  getPointInDirection = (x, y, dir) => {
    const newXPoint = x + this.getDirectionX(dir);
    const newYPoint = y + this.getDirectionY(dir);

    if (newXPoint < 0 || newXPoint >= this.width) {
      return;
    }
    
    if (newYPoint < 0 || newYPoint >= this.height) {
      return;
    }

    return this.grid[newYPoint][newXPoint];
  }

  generateWall = (x, y) => {
    const walls = Matter.Composite.create({ isStatic: true });
    const gridPoint = this.grid[y][x];
    const opts = { 
      isStatic: true,
      label: 'wall'
    };

    const wallThickness = 5;

    const topPoint = this.getPointInDirection(x, y, TOP);
    if (gridPoint !== TOP && topPoint !== this.getOpposite(TOP)) {
      Matter.Composite.add(walls, Matter.Bodies.rectangle(this.blockWidth / 2, 0, this.blockWidth, wallThickness, opts));
    }
    const bottomPoint = this.getPointInDirection(x, y, BOTTOM);
    if (gridPoint !== BOTTOM && bottomPoint !== this.getOpposite(BOTTOM)) {
      Matter.Composite.add(walls, Matter.Bodies.rectangle(this.blockWidth / 2, this.blockHeight, this.blockWidth, wallThickness, opts));
    }
    const leftPoint = this.getPointInDirection(x, y, LEFT);
    if (gridPoint !== LEFT && leftPoint !== this.getOpposite(LEFT)) {
      Matter.Composite.add(walls, Matter.Bodies.rectangle(0, this.blockHeight / 2, wallThickness, this.blockHeight + wallThickness, opts));
    }
    const rightPoint = this.getPointInDirection(x, y, RIGHT);
    if (gridPoint !== RIGHT && rightPoint !== this.getOpposite(RIGHT)) {
      Matter.Composite.add(walls, Matter.Bodies.rectangle(this.blockWidth, this.blockHeight / 2, wallThickness, this.blockHeight + wallThickness, opts));
    }
    
    const translate = Matter.Vector.create(x * this.blockWidth, y * this.blockHeight);
    Matter.Composite.translate(walls, translate);
    
    return walls;
  }


  carvePathFrom = (x, y, grid) => {
   
    const directions = [TOP, BOTTOM, RIGHT, LEFT]
      .sort(f => 0.5 - GetRandomNumber()); 

    directions.forEach(dir => {
      const nX = x + this.getDirectionX(dir);
      const nY = y + this.getDirectionY(dir);
      const xNeighborOK = nX >= 0 && nX < this.width;
      const yNeighborOK = nY >= 0 && nY < this.height;
      

      if (xNeighborOK && yNeighborOK && grid[nY][nX] == undefined) {
        grid[y][x] = grid[y][x] || dir;
        grid[nY][nX] = grid[nY][nX] || this.getOpposite(dir);
        this.carvePathFrom(nX, nY, grid);
      }
    }); 
  }

  
  this.carvePathFrom(0, 0, this.grid);

  for (var i = 0; i < this.grid.length; i++) {
    for (var j = 0; j < this.grid[i].length; j++) {
      Matter.Composite.add(this.matter, this.generateWall(j, i));
    }
  }


  return this.matter;
 
  
}

export default CreateMaze;