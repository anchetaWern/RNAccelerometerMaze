import React, { Component } from 'react';
import { View, Alert, Dimensions } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import RNRestart from 'react-native-restart';

import {
  accelerometer,
  setUpdateIntervalForType,
  SensorTypes
} from "react-native-sensors";

import Matter from 'matter-js';
import Circle from './src/components/Circle';
import Rectangle from './src/components/Rectangle';

import CreateMaze from './src/helpers/CreateMaze';
import GetRandomPoint from './src/helpers/GetRandomPoint';


const { height, width } = Dimensions.get('window');

const GRID_X = 11; 
const GRID_Y = 16;
const maze = CreateMaze(GRID_X, GRID_Y);

const BALL_SIZE = Math.floor(width * .02);
const ballStartPoint = GetRandomPoint(GRID_X, GRID_Y);
const theBall = Matter.Bodies.circle(
  ballStartPoint.x,
  ballStartPoint.y,
  BALL_SIZE,
  {
    label: "ball"
  }
);

const GOAL_SIZE = Math.floor(width * .04); 
const goalPoint = GetRandomPoint(GRID_X, GRID_Y);
const goal = Matter.Bodies.rectangle(goalPoint.x, goalPoint.y, GOAL_SIZE, GOAL_SIZE, {
  isStatic: true,
  isSensor: true,
  label: 'goal'
});

setUpdateIntervalForType(SensorTypes.accelerometer, 100);

export default class App extends Component {
  
  
  state = {
    ballX: theBall.position.x,
    ballY: theBall.position.y,
  }
  

  _setupCollisionHandler = (engine) => {
    Matter.Events.on(engine, "collisionStart", event => { 
      var pairs = event.pairs;

      var objA = pairs[0].bodyA.label;
      var objB = pairs[0].bodyB.label;
      
      if (objA === 'ball' && objB === 'goal') {
        Alert.alert(
          'Goal Reached!',
          'Do you want to start over?',
          [
            {
              text: 'Yes', 
              onPress: () => {
                RNRestart.Restart();
              }
            }
          ],
          { cancelable: true },
        );
      } else if (objA === 'wall' && objB === 'ball') {
        Matter.Body.setPosition(theBall, {
          x: ballStartPoint.x,
          y: ballStartPoint.y
        });
        
        this.setState({
          ballX: ballStartPoint.x,
          ballY: ballStartPoint.y
        });
       
      }
    });
  }


  componentDidMount() {
    const { engine, world } = this._addObjectsToWorld(maze, theBall, goal);
    this.entities = this._getEntities(engine, world, maze, theBall, goal);

    this._setupCollisionHandler(engine);

    accelerometer.subscribe(({ x, y }) => {
     
      Matter.Body.setPosition(theBall, {
        x: this.state.ballX + x,
        y: this.state.ballY + y
      });
      
      this.setState({
        ballX: x + this.state.ballX,
        ballY: y + this.state.ballY,
      });
    });
  }


 
  physics = (entities, { time }) => {
    let engine = entities["physics"].engine;
    engine.world.gravity = {
      x: 0,
      y: 0
    };
    Matter.Engine.update(engine, time.delta);
    return entities;
  }


  _addObjectsToWorld = (maze, ball, goal) => {
    const engine = Matter.Engine.create({ enableSleeping: false });
    const world = engine.world;

    Matter.World.add(world, [
      maze, 
      ball, 
      goal
    ]);

    return {
      engine,
      world
    }
  }


  _getEntities = (engine, world, maze, ball, goal) => {
    const entities = {
      physics: {
        engine,
        world
      },
      playerBall: {
        body: ball,
        bgColor: '#FF5877',
        borderColor: '#FFC1C1',
        renderer: Circle
      },
     
      goalBox: {
        body: goal,
        size: [GOAL_SIZE, GOAL_SIZE],
        color: '#414448',
        renderer: Rectangle
      }
     
    }
 
    const walls = Matter.Composite.allBodies(maze);
    walls.forEach((body, index) => {

      const { min, max } = body.bounds;
      const width = max.x - min.x;
      const height = max.y - min.y;
      
      Object.assign(entities, {
        ['wall_' + index]: {
          body: body,
          size: [width, height],
          color: '#fbb050',
          renderer: Rectangle
        }
      });
    });
   

    return entities; 
  }


  render() {
    if (this.entities) {
      return (
        <View style={styles.container}>
          <GameEngine
            systems={[this.physics]}
            entities={this.entities}
          >
          </GameEngine>
        </View>
      );
    }
    return null;
  }
}

const styles = {
  container: {
    flex: 1
  }
};