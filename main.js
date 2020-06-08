var http = require("http"); // http, fs, url등은 모듈이다.
var fs   = require("fs"); // 모듈들 : nodejs가 갖고있는 수많은 기능들을 비슷한 것끼리 묶어놓은 것.
var url  = require("url");

var app = http.createServer(function (request, response) {
    var _url      = request.url;
    var queryData = url.parse(_url, true).query; // url을 parse(분석)
    var pathname  = url.parse(_url, true).pathname;
    
    console.log(queryData.id);
    // console.log(url.parse(_url, true));
    //-> URL 정보가 객체에 담겨져있음을 확인할 수 있음
    // console.log(url.parse(_url, true).pathname);

    if(pathname === '/'){ // 궁금증 : 존재하지 않는 파일경로(쿼리 스트링으로)를 입력했을때 404가 뜨지않고 템플릿이 출력되는 이유가 뭘까...? 일반 경로는 정상적으로 404가 출력이 된다는 것...
        if(queryData.id === undefined){
            fs.readdir('./data/', function(err, fileList){
                var title       = 'Welcome';
                var description = 'Hello, Node.js';

                // fs.readdir()을 사용해 파일 목록을 불러 링크로 만들기
                var i     = 0;
                var list  = '<ul>';
                while(i < fileList.length){
                    list += `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`;
                    i++;
                };
                list     += '</ul>';

                var template = `
                    <!doctype html>
                    <html>
                    <head>
                    <title>WEB1 - ${title}</title>
                    <meta charset="utf-8">
                    </head>
                    <body>
                    <h1><a href="/">WEB</a></h1>
                    ${list}
                    <h2>${title}</h2>
                    <p>${description}</p>
                    </body>
                    </html>
            `;
            response.writeHead(200);
            response.end(template);
            });
        } else {
            fs.readdir('./data/', function(err, fileList){
                // fs.readdir()을 사용해 파일 목록을 불러 링크로 만들기
                var i     = 0;
                var list  = '<ul>';
                while(i < fileList.length){
                    list += `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`;
                    i++;
                };
                list     += '</ul>'; // 링크 끝

                fs.readFile(`data/${queryData.id}`, 'utf-8', function(err, description){
                    var title     = queryData.id;
                    var template = `
                        <!doctype html>
                        <html>
                        <head>
                        <title>WEB1 - ${title}</title>
                        <meta charset="utf-8">
                        </head>
                        <body>
                        <h1><a href="/">WEB</a></h1>
                        ${list}
                        <h2>${title}</h2>
                        <p>${description}</p>
                        </body>
                        </html>
                `; // 이 템플릿을 기준으로 HTML 구조가 그려진다..
                response.writeHead(200); // writeHead: 200 - 웹 서버에서 브라우저에게 파일을 성공적으로 전송했다는 뜻
                response.end(template); // 응답이 완료되었을 때 쿼리 스트링 값에 따라 정보를 출력(또는 어떤 문자열, 데이터등)
                });
            });
        }
    } else {
    response.writeHead(404); // 404 : 파일을 찾을 수 없다
    response.end('Not Found.'); 
    }

    // 200605 00:57 bak
    // response.end(fs.readFileSync(__dirname + url));
    // node.js가 경로에 해당되는 파일을 읽어서(__dirname + url) 값을 가져온다.
    // response.end()에 어떤 코드를 넣느냐에 따라서 사용자에게 전송하는 데이터가 바뀐다.
    // node.js는 프로그래밍적으로 사용자에게 전송할 데이터를 생성한다.
});
app.listen(3000);
