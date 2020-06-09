var http = require("http"); // http, fs, url등은 모듈이다.
var fs   = require("fs"); // 모듈들 : nodejs가 갖고있는 수많은 기능들을 비슷한 것끼리 묶어놓은 것.
var url  = require("url");
var qs   = require("querystring");

function templateHTML(title, list, body){
    return `
                <!doctype html>
                <html>
                <head>
                <title>WEB1 - ${title}</title>
                <meta charset="utf-8">
                </head>
                <body>
                <h1><a href="/">WEB</a></h1>
                ${list}
                <a href="/create">create</a>
                ${body}
                </body>
                </html>
            `;
};

function templateList(fileList){
    var i     = 0;
    var list  = '<ul>';
    while(i < fileList.length){
        list += `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`;
        i++;
    };
    list     += '</ul>';
    return list;
}

var app = http.createServer(function (request, response) {
    var _url      = request.url;
    var queryData = url.parse(_url, true).query; // url을 parse(분석)
    var pathname  = url.parse(_url, true).pathname;
    // console.log(url.parse(_url, true));
    //-> URL 정보가 객체에 담겨져있음을 확인할 수 있음
    // console.log(url.parse(_url, true).pathname);
    if(pathname === '/'){ // 궁금증 : 존재하지 않는 파일경로(쿼리 스트링으로)를 입력했을때 404가 뜨지않고 템플릿이 출력되는 이유가 뭘까...? 일반 경로는 정상적으로 404가 출력이 된다는 것...
        if(queryData.id === undefined){
            fs.readdir('./data/', function(err, fileList){
                var title       = 'Welcome';
                var description = 'Hello, Node.js';
                // fs.readdir()을 사용해 파일 목록을 불러 링크로 만들기
                var list = templateList(fileList);
                var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
            response.writeHead(200);
            response.end(template);
            });
        } else {
            fs.readdir('./data/', function(err, fileList){
                // fs.readdir()을 사용해 파일 목록을 불러 링크로 만들기
                var list = templateList(fileList);
                fs.readFile(`data/${queryData.id}`, 'utf-8', function(err, description){
                    var title     = queryData.id;
                    var template = templateHTML(title, list, `<h2>${title}</h2>${description}`); // 이 템플릿을 기준으로 HTML 구조가 그려진다..
                response.writeHead(200); // writeHead: 200 - 웹 서버에서 브라우저에게 파일을 성공적으로 전송했다는 뜻
                response.end(template); // 응답이 완료되었을 때 쿼리 스트링 값에 따라 정보를 출력(또는 어떤 문자열, 데이터등)
                });
            });
        }
    } else if( pathname === '/create') { // 글 생성 url일 때
        fs.readdir('./data/', function(err, fileList){
            var title       = 'WEB - create';
            var list = templateList(fileList);
            var template = templateHTML(title, list, `
                <form action="http://localhost:3000/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit">
                    <p>
                </form>
            `);
        response.writeHead(200);
        response.end(template);
        });
    } else if( pathname === '/create_process'){ // How do you extract POST data in Node.js?
        var body = '';
        request.on('data', function(data){
            body += data;
                // if(body.length > 1e6)
                //     request.connection.destroy(); 데이터 양이 클 때를 대비해서 접속을 끊는 코드를 작성했지만 여기서는 배제.
        }); // POST로 많은 데이터를 전송할 경우를 대비해서 조각난 데이터를 수신할 때 마다 콜백함수를 호출.. 호출할 때'data'인자를 통해서 수신한 정보를 주기로 약속하고있음.
        request.on('end', function(){
            var post        = qs.parse(body);
            var title       = post.title;
            var description = post.description;
            //console.log(post.title); // post는 객체로 정보를 담고있음 (객체화)
            
            // 받은 정보를 파일로 저장 fs.writeFile(file(저장할 위치), data(내용), callback)
            fs.writeFile(`data/${title}`, description, 'utf-8', function(err){
                response.writeHead(302, {Location: `/?id=${title}`}); // 302 : redirection, 루트를 기준으로 Location 지정
                response.end();
            });
        }); // 더이상 들어오는 정보가 없으면 'end'의 콜백함수를 호출. 정보 수신이 끝남.
    }
    else {
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
