"use strict";

function checkToken() {
  const token = localStorage.getItem("token");
  //console.log(token);
  if (!token) {
    window.location.href = "/";
  } else {
    console.log("key ok");
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

document.getElementById("logout").addEventListener("click", logout);
checkToken();
