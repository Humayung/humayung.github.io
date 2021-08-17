// const fruitBasket = {
//   apple: 27,
//   grape: 0,
//   pear: 14
// }

// const fruitsToGet = ['apple', 'grape', 'pear']

// const sleep = ms => {
//   return new Promise(resolve => setTimeout(resolve, ms))
// }

// const getNumFruit = fruit => {
//   return sleep(1000).then(v => fruitBasket[fruit])
// }

// const control = async _ => {
//   console.log('Start')

//   const numApples = await getNumFruit('apple')
//   console.log(numApples)

//   const numGrapes = await getNumFruit('grape')
//   console.log(numGrapes)

//   const numPears = await getNumFruit('pear')
//   console.log(numPears)

//   console.log('End')
// }

// control();

// const forLoop = async _ => {
//   console.log('Start')

//   for (let index = 0; index < fruitsToGet.length; index++) {
//     const fruit = fruitsToGet[index]
//     const numFruit = await getNumFruit(fruit)
//     console.log(numFruit)
//   }

//   console.log('End')
// }

// forLoop();

// const forEachLoop = _ => {
//   console.log('Start')

//   fruitsToGet.forEach(async fruit => {
//     const numFruit = await getNumFruit(fruit)
//     console.log(numFruit)
//   })

//   console.log('End')
// }

// forEachLoop();

// const mapLoop = async _ => {
//   console.log('Start')

//   const promises = fruitsToGet.map(async fruit => {
//     const numFruit = await getNumFruit(fruit)
//     return numFruit
//   })

//   const numFruits = await Promise.all(promises)
//   console.log(numFruits)

//   console.log('End')
// }

// mapLoop()

// const run = () => {
// 	return new Promise((resolve, reject) => {
// 		[ ...Array(10).keys() ].map((e) => [ ...Array(10).keys() ].map((val, index) => console.log('run1', index)));
// 		resolve();
// 	});
// };
// const run2 = () => {
// 	return new Promise((resolve, reject) => {
// 		[ ...Array(10).keys() ].map((e) => [ ...Array(10).keys() ].map((val, index) => console.log('run2', index)));
// 		resolve();
// 	});
// };
// const mainSeries = async () => {
// 	console.log('start');
// 	const start = new Date().getTime();
// 	await run();
// 	await run2();
// 	console.log('series', new Date().getTime() - start);
// };
// const mainParallel = async () => {
// 	console.log('start');
// 	const start = new Date().getTime();
// 	await Promise.all([ run(), run2() ]);
// 	console.log('parallel', new Date().getTime() - start);
// };
// mainSeries();
// mainParallel();