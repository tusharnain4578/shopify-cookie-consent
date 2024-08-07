document.addEventListener("DOMContentLoaded", async function () {
  const baseApi = "https://hans-peaceful-vertex-annual.trycloudflare.com";
  const consentBar = document.getElementById("tsweb-ck-ctr");
  const cookie_name = "tsweb_cookie_consent";

  async function getCKData() {
    const params = new URLSearchParams({
      shop: Shopify.shop,
    });

    const url = `${baseApi}/api/settings?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (response.ok) {
      const res = await response.json();

      if (res.success) {
        const settings = res.settings;
        document.querySelector("#tsweb_ck_accept").innerText =
          settings.accept_label;
        document.querySelector("#tsweb_ck_decline").innerText =
          settings.decline_label;
      }
    } else {
      console.error("Error:", response.statusText);
    }
  }

  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  }

  function getCookie(name) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  if (!getCookie(cookie_name)) {
    if (consentBar) {
      await getCKData();

      document.body.appendChild(consentBar);
      consentBar.classList.remove("tsweb-ck-ctr-hidden");

      function set_consent_ck(val) {
        setCookie(cookie_name, val, 365);
        if (consentBar) consentBar.style.display = "none";
      }
      document
        .getElementById("tsweb_ck_accept")
        .addEventListener("click", () => set_consent_ck("true"));
      document
        .getElementById("tsweb_ck_decline")
        .addEventListener("click", () => set_consent_ck("false"));
    }
  }
});
