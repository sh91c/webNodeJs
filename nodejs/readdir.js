var testFolder = './data/';
var fs = require('fs');

fs.readdir(testFolder, function(err, filelist){
    // filelist은 파일목록을 배열형태로 전달
    // -> 반복문을 통해 처리!
    console.log(filelist);
})