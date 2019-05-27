import { Dimensions } from 'react-native';
const { height, width } = Dimensions.get('window');

import GetRandomNumber from './GetRandomNumber';

const GetRandomPoint = (gridX, gridY) => {
  const gridXPart = (width / gridX);
  const gridYPart = (height / gridY);
  const x = Math.floor(GetRandomNumber() * gridX);
  const y = Math.floor(GetRandomNumber() * gridY);

  return {
    x: Math.floor(x * gridXPart + gridXPart / 2),
    y: Math.floor(y * gridYPart + gridYPart / 2)
  }
}


export default GetRandomPoint;