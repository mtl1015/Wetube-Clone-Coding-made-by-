const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComments = document.createElement("li");
  newComments.dataset.id = id;
  newComments.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = `   ${text}`;
  newComments.appendChild(icon);
  newComments.appendChild(span);
  videoComments.prepend(newComments);
  console.log(newComments);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoID = videoContainer.dataset.id;
  if (text.trim() === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoID}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", //express야 내가 지금 string같이 생긴 json파일을 보내고 있는거야! 그러니깐 json파일로 인식해!라고 말하는 것.
    },
    body: JSON.stringify({ text }),
  });

  if (response.status === 201) {
    textarea.value = "";
    const { newCommentID } = await response.json();
    addComment(text, newCommentID);
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}
