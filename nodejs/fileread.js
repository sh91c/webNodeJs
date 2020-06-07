// Node.js의 파일 읽기 기능
// File system - readFile()
var fs = require('fs');

// 문자 인코딩 utf-8을 작성해야함!
fs.readFile('nodejs/sample.txt', 'utf-8', function(err, data){
    console.log(data);
});