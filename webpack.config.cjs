const path = require("path");

//여기는 webpack파일. webpack CLI를 이용해서 콘솔에서 webpack을 불러 올 수 있다.
//여기서는 webpack이 읽을 configuration파일을 내보낼 것이다.
//두가지를 조심해야 한다.그니깐, 2가지 특성이 있다.
//Entry: 우리가 처리하고자 하는 파일이다. 그니깐 내가 쓰는 javascript코드를 의미한다.
//output: entry로 지정한 파일을 변환시켜서 그 파일을 path경로에 있는 디렉토리에 finename이라는 이름으로 저장을 하는 것이다.
//그리고 package.json파일로 가서 assests로 시작하는 script를 하나 만들자.
//참고로, script는 명령어를 더 짧게 만드는데 사용된다.
//우리가 이걸 하는것은 front end code를 시행시키기 위한 것이라는 것을 기억하자. 그니까 얘네 front end code이다.
//근데 파일경로는 절대경로여야 한다. 상대경로가 아니라,,,그니깐 완벽한 경로가 필요하다는 것이다.
//이것을 다 쓰기에는 번거로우니깐, path.resolve() 랑 __dirname 둘이서 이것을 해결해 줄 것이다.
//__dirname은 javascript가 제공하고 있는 상수이다.
//즉, directory name으로서, 말 그대로 파일까지의 경로 전체를 지칭한다.
//path.resolve(a,b,c)는 안에 있는 속성을 파일 경로의 형식으로 하나로 합치는 것이다.
//즉, path.resolve(__dirname, "assests", "js")라 하면, 우리가 원하는 파일 경로를 얻을 수 있을 것이다.
module.exports = {
  mode: "development",
  entry: "./src/client/js/main.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "assets", "js"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
    ],
  },
};
//이제 rules라는 것에 대해 배워보자.
//rules는 우리가 각각의 파일 종류에 따라 어떤 전환을 할 건지 결정하는 것이다.
//위의 과정은 rule을 통해 js코드들을 babel-loader라는 loader로 가공한다는 것을 의미한다.(작명센스가 suck이다.)
//아무튼, const path과정부터 test에 있는 내용까지는 기억하고 있어야 한다. webpack 설정의 기본 중 기본이기 때문.
