var fs = require('fs');

// readFileSync : 동기 처리
// console.log('A');
// var result = fs.readFileSync('syntex/sample.txt', 'utf-8');
// -> readFileSync는 return값을 줘야하기 때문에 변수에 담아야함
// console.log(result);
// console.log('C');

// readFile : 비동기 처리
console.log('A');
fs.readFile('syntex/sample.txt', 'utf-8', function(err, result){
// readFile은 리턴값이 아니다. 함수의 세 번째 인자에 콜백함수를 줘야함.
    console.log(result);
});
console.log('C');
// 결과: A C B
// readFile이 순서에 맞게 동작이 계속 진행되다가 콜백함수가 호출되면서
// 콜백함수의 결과가 나중에 실행되었음.