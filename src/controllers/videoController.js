import Video from "../models/Video.js";
import User from "../models/User.js";
import comment from "../models/Comment.js";
import { async } from "regenerator-runtime";
import Comment from "../models/Comment.js";
/*
console.log("start")
Video.find({}, (error, videos) => {
   if(error){
    return res.render("server-error")
  }
  return res.render("home", { pageTitle: "Home", videos });
});
console.log("finished")
*/

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  if (!videos) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  return res.render("home", { pageTitle: "Home", videos });
};
export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comments");
  //(원래는 코드)const owner = await User.findById(video.owner);
  //이런 방식으로 Video 랑 User를 연결시킬 수 있다.
  //다시 말하면, User collection의 ID를 Video에 있는 owner라는 객체에 들어있는 id로 찾는 것이다.
  //db에 두번 요청해서 마음에 드는 모양새는 아니지만, 그래도, video는 Video collection의 id로,
  //owner은, user에 있는 id로 찾아서,,, watch template로 보내버리는 것.
  //근데, 굳이 영상 소유자의 id를 video에 저장해야 하는 이유가 있을까? 그 이유에 대해서 알아보자.
  //1. 영상 소유쥬와 현재 접속자의 id를 서로 비교할 수 있다. 그냥 id를 썼으면 한개밖에 없어서 비교가 안된다.
  //2. 그리거, 영상 소유주의 이름을 보여줄 수 있다.
  //하지만, 이게 그렇게 좋은 코드는 아니다. 더 줄일 수 있으므로!
  //그래서 우리는 populate를 써줄 수 있다.
  //populate는 무엇인가요? populate는 ()안에 있는 것을 실제 User data로 채워준다.
  //그래서 단순한 string형식의 owner대신, user collection에 들어있는 owner object가 통째로 불러와진다.
  //근데 이게 어떻게 가능했을까? 그것은 Video model에 가보면, ref가 'User'로 되어있기 때문에,
  //Video model이 populate한 것의 대상이 User가 된 것이다.
  //그래서 user객체 전체를 owner라는 이름으로 가지게 되는 것이다!!

  return res.render("watch", { pageTitle: video.title, video }); //원래는 owner가 있다.
};
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== _id) {
    req.flash("error", "로그인이 필요합니다.");
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
};
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id });
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== _id) {
    req.flash("error", "You are not the the owner of the video.");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files;
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileURL: Video.changePathFormula(video[0].path),
      thumbURL: Video.changePathFormula(thumb[0].path),
      owner: _id, //user object 전체를 전송할 필요 없이 id만 전송
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    return res.render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};
export const deleteVideo = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { id } = req.params;
  const user = await User.findById(_id);
  const video = await Video.findById(id);
  if (String(video.owner) !== _id) {
    return res.status(403).redirect("/");
  }
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  await Video.findByIdAndDelete(id);
  user.videos.splice(user.videos.indexOf(id), 1);
  user.save();
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(`${keyword}$`, "i"),
      },
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos });
};

//이번에는 pug를 렌더링하지 않는 controller를 만들어 볼거에요!
export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    //status를 써서 상태코드를 보내려면, 그 뒤에 꼭 render로 템플릿을 만들거나, redirect로 이동하는 사이트를 지정해주어야 한다.
    //그런것을 안할려면, sendStatus를 쓰면 된다.
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;

  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(400);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({ newCommentID: comment._id });
};
