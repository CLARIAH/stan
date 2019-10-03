import Stan from './Stan';

const stan = new Stan(undefined);


document.body.textContent = stan.activeAnnotation ? stan.activeAnnotation.id : 'empty';



// var p = new Promise<string>((resolve, reject) => {
//     resolve('a string');
// });