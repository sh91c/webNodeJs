var http = require("http"); // http, fs, url등은 모듈이다.
var fs = require("fs"); // 모듈 : nodejs가 갖고있는 수많은 기능들을 비슷한 것기리 묶어놓은 것.
var url = require("url");

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query; // url을 parse(분석)
    var title = queryData.id;
    console.log(queryData.id);
    if (_url == "/") {
        title = "Welcome";
    }
    if (_url == "/favicon.ico") {
        response.writeHead(404);
        response.end();
        return;
    }
    response.writeHead(200);
    var template = `
    <!doctype html>
    <html>
    <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
    </head>
    <body>
    <h1><a href="/">WEB</a></h1>
    <ul>
        <li><a href="/?id=HTML">HTML</a></li>
        <li><a href="/?id=CSS">CSS</a></li>
        <li><a href="/?id=JavaScript">JavaScript</a></li>
    </ul>
    <h2>${title}</h2>
    <p><a href="https://www.w3.org/TR/html5/" target="_blank" title="html5 speicification">Hypertext Markup Language (HTML)</a> is the standard markup language for <strong>creating <u>web</u> pages</strong> and web applications.Web browsers receive HTML documents from a web server or from local storage and render them into multimedia web pages. HTML describes the structure of a web page semantically and originally included cues for the appearance of the document.
    <img src="coding.jpg" width="100%">
    </p><p style="margin-top:45px;">HTML elements are the building blocks of HTML pages. With HTML constructs, images and other objects, such as interactive forms, may be embedded into the rendered page. It provides a means to create structured documents by denoting structural semantics for text such as headings, paragraphs, lists, links, quotes and other items. HTML elements are delineated by tags, written using angle brackets.
    </p>
    </body>
    </html>
    `;
    response.end(template); // 쿼리 스트링에 따라 다른 정보를 출력

    // 200605 00:57 bak
    // response.end(fs.readFileSync(__dirname + url));
    // node.js가 경로에 해당되는 파일을 읽어서(__dirname + url) 값을 가져온다.
    // response.end()에 어떤 코드를 넣느냐에 따라서 사용자에게 전송하는 데이터가 바뀐다.
    // node.js는 프로그래밍적으로 사용자에게 전송할 데이터를 생성한다.
});
app.listen(3000);
