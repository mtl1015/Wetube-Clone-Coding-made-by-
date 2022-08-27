import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  fileURL: { type: String, required: true },
  thumbURL: { type: String, required: true },
  description: { type: String, required: true, trim: true, minLength: 20 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  //owner은 type이 obejectid이다.ref는 mongoose에게 어떤 model의 id를 참조할지 알려줘야 하기 때문이다.
});
videoSchema.static("changePathFormula", function (urlPath) {
  return urlPath.replace(/\\/g, "/");
});

videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

videoSchema.pre("save", async function () {
  console.log("About to save:", this);
});

const Video = mongoose.model("Video", videoSchema);

export default Video;
