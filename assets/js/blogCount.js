/*
 * Count page views form GA or local cache file.
 *
 * Dependencies:
 *   - jQuery
 *   - countUpBlog.js <https://github.com/inorganik/countUpBlog.js>
 */

const todayURL = "https://junvue-blog.du.r.appspot.com/query?id=ag12fmp1bnZ1ZS1ibG9nchULEghBcGlRdWVyeRiAgICYpteACgw";
const totalURL = "https://junvue-blog.du.r.appspot.com/query?id=ag12fmp1bnZ1ZS1ibG9nchULEghBcGlRdWVyeRiAgICYpteACQw";

const getInitStatusBlog = (function () {
    let hasInit = false;
    return () => {
      let ret = hasInit;
      if (!hasInit) {
        hasInit = true;
      }
      return ret;
    };
  }());

  const BlogPvOpts = (function () {
    function getContent(selector) {
      return $(selector).attr("content");
    }
  
    function hasContent(selector) {
      let content = getContent(selector);
      return (typeof content !== "undefined" && content !== false);
    }
  
    return {
      getProxyMeta() {
        return todayURL;
      },
      getLocalMeta() {
        return getContent("meta[name=pv-cache-path]");
      },
      hasLocalMeta() {
        return hasContent("meta[name=pv-cache-path]");
      }
    };
  
  }());
  
  const blogPvStorage = (function () {
    const Keys = {
      KEY_PV: "blog-pv",
      KEY_PV_SRC: "blog-pv_src",
      KEY_CREATION: "blog-pv_created_date"
    };
  
    const Source = {
      LOCAL: "same-origin",
      PROXY: "cors"
    };
  
    function get(key) {
      return localStorage.getItem(key);
    }
  
    function set(key, val) {
      localStorage.setItem(key, val);
    }
  
    function saveCache(pv, src) {
      set(Keys.KEY_PV, pv);
      set(Keys.KEY_PV_SRC, src);
      set(Keys.KEY_CREATION, new Date().toJSON());
    }
  
    return {
      keysCount() {
        return Object.keys(Keys).length;
      },
      hasCache() {
        return (localStorage.getItem(Keys.KEY_PV) !== null);
      },
      getCache() {
        return JSON.parse(localStorage.getItem(Keys.KEY_PV));
      },
      saveLocalCache(pv) {
        saveCache(pv, Source.LOCAL);
      },
      saveProxyCache(pv) {
        saveCache(pv, Source.PROXY);
      },
      isExpired() {
        let date = new Date(get(Keys.KEY_CREATION));
        date.setHours(date.getHours() + 1);   // per hour
        return Date.now() >= date.getTime();
      },
      isFromLocal() {
        return get(Keys.KEY_PV_SRC) === Source.LOCAL;
      },
      isFromProxy() {
        return get(Keys.KEY_PV_SRC) === Source.PROXY;
      },
      newerThan(pv) {
        return blogPvStorage.getCache().totalsForAllResults["ga:pageviews"] > pv.totalsForAllResults["ga:pageviews"];
      },
      inspectKeys() {
        if (localStorage.length !== blogPvStorage.keysCount()) {
          localStorage.clear();
          return;
        }
  
        for(let i = 0; i < localStorage.length; i++){
          const key = localStorage.key(i);
          switch (key) {
            case Keys.KEY_PV:
            case Keys.KEY_PV_SRC:
            case Keys.KEY_CREATION:
              break;
            default:
              localStorage.clear();
              return;
          }
        }
      }
    };
  }()); /* blogPvStorage */
  
  function countUpBlog(min, max, destId) {
    if (min < max) {
      let numAnim = new countUpBlog(destId, min, max);
      if (!numAnim.error) {
        numAnim.start();
      } else {
        console.error(numAnim.error);
      }
    }
  }
  
  function countBlogPV(path, rows) {
    let count = 0;
  
    if (typeof rows !== "undefined" ) {
      for (let i = 0; i < rows.length; ++i) {
        const gaPath = rows[parseInt(i, 10)][0];
        if (gaPath === path) { /* path format see: site.permalink */
          count += parseInt(rows[parseInt(i, 10)][1], 10);
          break;
        }
      }
    }
  
    return count;
  }
  
  function tackleBlogPV(rows, path, elem, hasInit) {
    let count = countBlogPV(path, rows);
    count = (count === 0 ? 1 : count);
  
    if (!hasInit) {
      elem.text(new Intl.NumberFormat().format(count));
    } else {
      const initCount = parseInt(elem.text().replace(/,/g, ""), 10);
      if (count > initCount) {
        countUpBlog(initCount, count, elem.attr("id"));
      }
    }
  }
  
  function displayBlogPageviews(data) {
    if (typeof data === "undefined") {
      return;
    }
  
    let hasInit = getInitStatusBlog();
    const rows = data.rows; /* could be undefined */

    console.log(rows);

    /*
  
    if ($("#post-list").length > 0) {
      $(".post-preview").each(function() {
        const path = $(this).find("a").attr("href");
        tackleBlogPV(rows, path, $(this).find(".pageviews"), hasInit);
      });
  
    } else if ($(".post").length > 0) {
      const path = window.location.pathname;
      tackleBlogPV(rows, path, $("#pv"), hasInit);
    }
    */
  }
  
  function fetchProxyBlogPageviews() {
    $.ajax({
    type: "GET",
    url: BlogPvOpts.getProxyMeta(),
    dataType: "jsonp",
    jsonpCallback: "displayBlogPageviews",
    success: (data) => {
        blogPvStorage.saveProxyCache(JSON.stringify(data));
        console.log("세이브프록시캐쉬햇어용");
    },
    error: (jqXHR, textStatus, errorThrown) => {
        console.log("Failed today pageviews: " + errorThrown);
    }
    });
  }
  
  function fetchLocalBlogPageviews(hasCache = false) {
    return fetch(BlogPvOpts.getLocalMeta())
      .then(response => response.json())
      .then(data => {
        if (hasCache) {
          // The cache from the proxy will sometimes be more recent than the local one
          if (blogPvStorage.isFromProxy() && blogPvStorage.newerThan(data)) {
            console.log("여기걸리긴하세용?");
            return;
          }
        }
        displayBlogPageviews(data);
        blogPvStorage.saveLocalCache(JSON.stringify(data));
        console.log("세이브로컬캐쉬햇어용");
      });
  }
  
  $(function() {  
    blogPvStorage.inspectKeys();
  
    if (blogPvStorage.hasCache()) {
        console.log("갖고있나영?");
      displayBlogPageviews(blogPvStorage.getCache());
  
      if (blogPvStorage.isExpired()) {
        if (BlogPvOpts.hasLocalMeta()) {
          fetchLocalBlogPageviews(true).then(fetchProxyBlogPageviews);
        } else {
          fetchProxyBlogPageviews();
        }
  
      } else {
        if (blogPvStorage.isFromLocal()) {
          fetchProxyBlogPageviews();
        }
      }
    } else { // no cached
        console.log("않갖고있는데영");
      if (BlogPvOpts.hasLocalMeta()) {
        console.log("갖고있나영?2");
        fetchLocalBlogPageviews().then(fetchProxyBlogPageviews);
      } else {
        console.log("않갖고있는데영2");
        fetchProxyBlogPageviews();
      }
    }
  
  });
  