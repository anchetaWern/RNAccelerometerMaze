var seed = Math.random() * (100 - 5) + 5;
const GetRandomNumber = () => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export default GetRandomNumber;