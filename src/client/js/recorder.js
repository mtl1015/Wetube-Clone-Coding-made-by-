import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const actionBtn = document.getElementById("actionBtn");
const videoPreview = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const downloadFile = (fileURL, fileName) => {};

const handleDownload = async () => {
  actionBtn.removeEventListener("click", handleDownload);
  actionBtn.innerText = "TransCoding...";
  actionBtn.disabled = true;

  const ffmpeg = createFFmpeg({
    corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
    log: true,
  });
  await ffmpeg.load();
  //아 그리고, ffmpeg는 원래는 백엔드에서 쓰지만, 웹어셈블리 덕분에 프론트엔드에서 쓸 수 있게 되었다고 한다.
  //사용자가 소프트웨어를 사용할 것이기 때문에 ffmpeg를 불러와준다.
  //그니깐, 사용자가 js가 아닌 다른 코드를 사용하는 방식이다.(무언가의 설치를 통해서)
  //소프트웨어가 무거우면 다음 코드로 넘어가 버릴 수 있으니 await을 쓰는 것

  //이제 ffmpeg세계에서 파일을 생성해 보자.
  ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile)); //ffmpeg에서 가상의 파일을 생성!(백엔드에서는 multer가 하는 일)

  //recording.webm은 우리가 만드는 파일의 포맷이다.
  //그다음 인자는 바이너리를 넣어야 하는데,
  //바이너리는 읽거나 쓰거나 수정하는게 아닌, 0과 1의 조합이므로 컴파일 해주어야 한다.
  await ffmpeg.run("-i", "recording.webm", "-r", "60", "output.mp4");
  //ffmpeg.run은 가상 컴퓨터에 이미 존재하는 파일을 input으로 받는 것이다. 그 다음 인자는 output으로 설정하는데,
  //이렇게 하면 input 을 output으로 변환하는 작업을 할 수 있다.
  //"60": 프레임을 60으로 고정하는 명령어. "-r"

  //---------------------------------------------------------------------------
  //이건 다음 썸네일을 만드는 과정이다.
  await ffmpeg.run(
    "-i",
    "recording.webm",
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    "thumbnail.jpg"
  );
  //그니깐 저 위 코드는 webm파일을 mp4로 변환하고 싶다고 ffmpeg에게 이야기하는 것이고,
  //이 코드는 webmㅠㅏ일을 가지고 jpg 썸네일을 추출하고 ffmpeg에게 이야기하는 것이다.
  const thumbFile = await ffmpeg.FS("readFile", "thumbnail.jpg");
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });
  const thumbURL = URL.createObjectURL(thumbBlob);

  const thumbA = document.createElement("a");
  thumbA.href = thumbURL;
  thumbA.download = "MyThumbnail.jpg";
  document.body.appendChild(thumbA);
  thumbA.click();
  //------------------------------------------------------------------------
  //이제 output.mp4를 이용해 볼 것이다. FS를 이용해서!

  const mp4File = await ffmpeg.FS("readFile", "output.mp4");

  //자바스크립트가 파일을 표현하는 방법 [1, 23, 42, 52, 161, ...등등] 몇십만개로 구성된 배열로 표현한다.
  //당연히, 이것을 파일 또는 영상처럼 표현할 수는 없다.
  //그것을 영상처럼 표현하는 도구가 필요한데, 그때 쓰는것이 blob이다.
  //다시 정의하면, blob은 binary정보를 가지고 있는 파일이라는 의미이다.
  //이 binary file에 접근하기 위해서는 buffer를 사용해야 한다.
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  //blob은 다음과 같이 배열 안에 배열을 받을 수 있다.
  //ondataavailable이라는 함수에서 이미 blob을 이용했다. 녹화가 끝나면 생성되는 데이터가 blob.
  const mp4URL = URL.createObjectURL(mp4Blob);

  //이렇게 하고, 경로랑 파일약자만 mp4형태로 바꾸면 이제 webm이 아닌 mp4로 영상을 뽑을 수 있다.
  //이것을 우리는 브라우저에서 transcoding을 했다고 한다!
  const a = document.createElement("a");
  a.href = mp4URL;
  a.download = "MyRecording.mp4";
  document.body.appendChild(a);
  a.click();

  //웹사이트의 속도 유지를 위해서,  파일의 링크를 해체하자.
  ffmpeg.FS("unlink", "recording.webm");
  ffmpeg.FS("unlink", "output.mp4");
  ffmpeg.FS("unlink", "thumbnail.jpg");
  URL.revokeObjectURL(mp4URL);
  URL.revokeObjectURL(thumbURL);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", handleStart);
};

const handleStop = () => {
  actionBtn.innerText = "Download Recording";
  actionBtn.removeEventListener("click", handleStop);
  actionBtn.addEventListener("click", handleDownload);
  recorder.stop();
};

const handleStart = () => {
  actionBtn.innerText = "Stop Recording";
  actionBtn.removeEventListener("click", handleStart);
  actionBtn.addEventListener("click", handleStop);
  recorder = new window.MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    videoPreview.srcObject = null;
    videoPreview.src = videoFile;
    videoPreview.loop = true;
    videoPreview.play();
    //브라우저 메모리에만 이용가능한 URL를 만든다.
    //그니깐, 브라우저의 메모리만 가리키는 URl이라고 보면 된다.
    //그니깐, 브라우저가 만든 URL이라 브라우저만 접근이 가능하다. 브라우저 상에만 존재하므로
    //그래서 이 파일로 뭘 해볼려면, 파일을 URl에 집어넣어서 접근가능하게끔 만들어야 한다.
  };
  recorder.start();
};
//미리보기용
const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 1024,
      height: 576,
    },
  });
  videoPreview.srcObject = stream;
  videoPreview.play();
};

init();
actionBtn.addEventListener("click", handleStart);
