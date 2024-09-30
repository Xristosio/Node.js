"use strict";

// Ανακτά το CSRF token από τα cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

// Ανάκτηση του CSRF token
const csrfToken = getCookie("XSRF-TOKEN");

async function checkAuth() {
  try {
    const response = await fetch("http://127.0.0.1:3000/verify", {
      method: "GET",
      credentials: "include", // Αποστολή των cookies
    });

    if (response.status === 401 || response.status === 403) {
      // Αν το token είναι άκυρο ή δεν υπάρχει, ανακατεύθυνση στη σελίδα login
      window.location.href = "/index.html";
    } else {
      const data = await response.json();
      console.log("Authentication successful:", data.message);
      // Μπορείς να κάνεις render τη σελίδα ή άλλες λειτουργίες αν το token είναι έγκυρο
    }
  } catch (error) {
    console.error("Error:", error);
    window.location.href = "/index.html"; // Ανακατεύθυνση σε περίπτωση σφάλματος
  }
}

// η συνάρτηση μόλις φορτωθεί η σελίδα
checkAuth();

document.getElementById("logout").addEventListener("click", function () {
  fetch("http://127.0.0.1:3000/logout", {
    method: "POST",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      window.location.href = "/index.html";
    })
    .catch((err) => alert("Error:", err));
});

// fetch("http://127.0.0.1:3000/verify", {
//   method: "GET",
//   credentials: "include",
// })
//   .then((response) => {
//     if (!response) window.location.href = "/index.html";
//     return response.json();
//   })
//   .catch((err) => alert("Error:", err));
