var base_url = window.location.origin;
function login() {
  let url = base_url + "/api/V1/login";
  $.post(url, {password: $("#pass").val()}, (res) => {
    if (res.code === 301)
      alert("the pass is incorrect");
    else
      window.location.reload();
  });
}