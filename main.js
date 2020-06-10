var http = require("http"); // http, fs, url등은 모듈이다.
var fs   = require("fs"); // 모듈들 : nodejs가 갖고있는 수많은 기능들을 비슷한 것끼리 묶어놓은 것.
var url  = require("url");
var qs   = require("querystring");

function templateHTML(title, list, body, control){
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
                ${control}
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
            fs.readdir('./data/', 'utf-8', function(err, fileList){
                var title       = 'Welcome';
                var description = 'Hello, Node.js';
                // fs.readdir()을 사용해 파일 목록을 불러 링크로 만들기
                var list = templateList(fileList);
                var template = templateHTML(title, list
                    , `<h2>${title}</h2>${description}`
                    , `<a href="/create">create</a>`); // root에서 update 기능은 제외
            response.writeHead(200);
            response.end(template);
            });
        } else {
            fs.readdir('./data/', 'utf-8', function(err, fileList){
                // fs.readdir()을 사용해 파일 목록을 불러 링크로 만들기
                var list = templateList(fileList);
                fs.readFile(`data/${queryData.id}`, 'utf-8', function(err, description){
                    var title     = queryData.id;
                    var template = templateHTML(title, list
                        , `<h2>${title}</h2>${description}`
                        , `<a href="/create">create</a>
                           <a href="/update?id=${title}">update</a>
                           <form action="/delete_process" method="post" onsubmit="return confirm('do you want to delete this file?')">
                            <input type="hidden" name="id" value="${title}">
                            <input type="submit" value="delete">
                           </form>
                           `);
                        // 1.이 템플릿을 기준으로 HTML 구조가 그려진다..
                        // 2. update(수정)시 쿼리스트링을 사용해 /update?id=${title}로 수정링크를 생성
                        // 3. delete는 GET방식으로 구현하면 안된다! POST 방식으로 해야함.
                response.writeHead(200); // writeHead: 200 - 웹 서버에서 브라우저에게 파일을 성공적으로 전송했다는 뜻
                response.end(template); // 응답이 완료되었을 때 쿼리 스트링 값에 따라 정보를 출력(또는 어떤 문자열, 데이터등)
                });
            });
        }
    } else if( pathname === '/create') { // 글 생성 url일 때
        fs.readdir('./data/', 'utf-8', function(err, fileList){
            var title       = 'WEB - create';
            var list = templateList(fileList);
            var template = templateHTML(title, list, `
                <form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit">
                    <p>
                </form>
            `, '');
        response.writeHead(200);
        response.end(template);
        });
    } else if( pathname === '/create_process'){ // How do you extract POST data in Node.js?
        var body = '';
        request.on('data', function(data){
            body += data;
                // if(body.length > 1e6)
                //     request.connection.destroy(); 데이터 양이 클 때를 대비해서 접속을 끊는 코드를 작성했지만 여기서는 배제.response.writeHead(200);
        // response.end('success');
        }); // POST로 많은 데이터를 전송할 경우를 대비해서 조각난 데이터를 수신할 때 마다 콜백함수를 호출.. 호출할 때'data'인자를 통해서 수신한 정보를 주기로 약속하고있음.
        request.on('end', function(){
            var post        = qs.parse(body);
            var title       = post.title;
            var description = post.description;
            //console.log(post.title); // post는 객체로 정보를 담고있음 (객체화)
            
            // 받은 정보를 파일로 저장 fs.writeFile(file(저장할 위치), data(내용), callback)
            fs.writeFile(`data/${title}`, description, 'utf-8', function(err){
                response.writeHead(302, {Location: `/?id=${qs.escape(title)}`}); // 302 : redirection, 루트를 기준으로 Location 지정
                response.end();
            });
        }); // 더이상 들어오는 정보가 없으면 'end'의 콜백함수를 호출. 정보 수신이 끝남.
    } else if ( pathname === '/update') {
        // 글을 수정할 시에 필요한 기능 2가지:
        // 1. 기존에 작성된 글의 파일을 불러와야함.
        // 2. form 태그를 사용해 글 또는 내용을 수정할 수 있어야 함.
        fs.readdir('./data/', 'utf-8', function(err, fileList){
            var list = templateList(fileList);
            fs.readFile(`data/${queryData.id}`, 'utf-8', function(err, description){
                var title     = queryData.id;
                var template = templateHTML(title, list
                    , `
                    <form action="/update_process" method="post">
                        <!-- 원 글제목을 기준으로 수정을 하지못하게하고 보이지 않도록해야함 -->
                        <!-- 이 부분 --> <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p>
                            <textarea name="description" placeholder="description">${description}</textarea>
                        </p>
                        <p>
                            <input type="submit">
                        <p>
                    </form>
                    `
                    , `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);

            response.writeHead(200);
            response.end(template);
            });
        });
    } else if( pathname === '/update_process'){
        // nodejs file rename -> fs.rename(oldPath, newPath, callback(err))
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var post        = qs.parse(body);
            var id          = post.id;
            var title       = post.title;
            var description = post.description;
            // 1. 사용자가 제목을 변경할 경우 -> title변수로 전달
            fs.rename(`data/${id}`, `data/${title}`, function(err){
                // 2. 사용자가 내용을 변경할 경우 -> 파라메터 description로 전달
                fs.writeFile(`data/${title}`, description, 'utf-8', function(err){
                    response.writeHead(302, {Location: `/?id=${qs.escape(title)}`});
                    response.end();
                });
            });
           console.log(post);
        });
    } else if( pathname === '/delete_process'){
        // nodejs file rename -> fs.rename(oldPath, newPath, callback(err))
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var post        = qs.parse(body);
            var id          = post.id;
            // 파일 삭제 : fs.unlink(path, callback(err))
            fs.unlink(`data/${id}`, function () {
                response.writeHead(302, {Location: `/`}); // 글 삭제 후 루트로 이동
                response.end();
            });
        });
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
