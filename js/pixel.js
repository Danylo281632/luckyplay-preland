/* LUCKYPLAY — Meta Pixel helpers
 * - Reads incoming URL params (fbclid, sub1-3, utm_*, ttclid, bgp)
 * - Reads _fbp cookie set by Meta Pixel
 * - Builds offer URL with real fbp / fbc / sub values
 * - Rewrites every CTA <a> href so postback to FB attributes the conversion
 * - Fires Lead event on CTA click
 */
(function () {
  "use strict";

  const OFFER_BASE = "https://like-official.appleuzlike.site/";
  const OFFER_HOST = "like-official.appleuzlike.site";

  function getCookie(name) {
    const m = document.cookie.match(
      new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)")
    );
    return m ? decodeURIComponent(m[1]) : "";
  }

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function buildFbc() {
    const existing = getCookie("_fbc");
    if (existing) return existing;
    const fbclid = getQueryParam("fbclid");
    if (!fbclid) return "";
    const fbc = "fb.1." + Date.now() + "." + fbclid;
    try {
      document.cookie = "_fbc=" + encodeURIComponent(fbc) + "; path=/; max-age=" + 60 * 60 * 24 * 90;
    } catch (e) {}
    return fbc;
  }

  function buildOfferUrl() {
    const fbp = getCookie("_fbp");
    const fbc = buildFbc();
    const ttclid = getQueryParam("ttclid");
    const ttp = getCookie("_ttp") || ttclid;

    const p = new URLSearchParams();
    p.set("fbp", fbp);
    p.set("fbc", fbc);
    p.set("ttp", ttp);
    p.set("bgp", getQueryParam("bgp"));
    p.set("sub1", getQueryParam("sub1") || getQueryParam("utm_campaign"));
    p.set("sub2", getQueryParam("sub2") || getQueryParam("utm_content"));
    p.set("sub3", getQueryParam("sub3") || getQueryParam("utm_term"));

    return OFFER_BASE + "?" + p.toString();
  }

  function rewriteLinks() {
    const url = buildOfferUrl();
    window.LP_OFFER_URL = url;
    document.querySelectorAll("a[href]").forEach(function (a) {
      const h = a.getAttribute("href") || "";
      if (h.indexOf(OFFER_HOST) !== -1) a.setAttribute("href", url);
    });
  }

  function onCtaClick(e) {
    const a = e.target.closest("a[href]");
    if (!a) return;
    if ((a.getAttribute("href") || "").indexOf(OFFER_HOST) === -1) return;
    a.setAttribute("href", buildOfferUrl());
    if (typeof window.fbq === "function") {
      try { window.fbq("track", "Lead"); } catch (e) {}
    }
  }

  document.addEventListener("DOMContentLoaded", rewriteLinks);
  window.addEventListener("load", rewriteLinks);
  document.addEventListener("click", onCtaClick, true);
})();
