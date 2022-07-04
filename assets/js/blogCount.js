/*
 * Count page views form GA or local cache file.
 *
 * Dependencies:
 *   - jQuery
 *   - countUpBlog.js <https://github.com/inorganik/countUpBlog.js>
 */

const getInitStatusBlog = (function () {
  let today_hasInit = false;
  let total_hasInit = false;

  return {
    status(type) {
      if(type == "today") {
        let ret = today_hasInit;
  
        if (!today_hasInit) {
          today_hasInit = true;
        }
  
        return ret;
      } else if(type == "total") {
        let ret = total_hasInit;
  
        if (!total_hasInit) {
          total_hasInit = true;
        }
  
        return ret;
      }
    }
  }
}());

function getAPI_URL(type) {
  const todayURL = "https://junvue-blog.du.r.appspot.com/query?id=ag12fmp1bnZ1ZS1ibG9nchULEghBcGlRdWVyeRiAgICYpteACgw";
  const totalURL = "https://junvue-blog.du.r.appspot.com/query?id=ag12fmp1bnZ1ZS1ibG9nchULEghBcGlRdWVyeRiAgICYpteACQw";

  if (type == "today")
    return todayURL;
  else (type == "total")
    return totalURL;
}

const blogPvStorage = (function () {
  const today_Keys = {
    KEY_PV: "today-pv",
    KEY_PV_SRC: "today-pv_src",
    KEY_CREATION: "today-pv_created_date"
  };

  const total_Keys = {
    KEY_PV: "total-pv",
    KEY_PV_SRC: "total-pv_src",
    KEY_CREATION: "total-pv_created_date"
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

  function saveCache(type, pv, src) {
    if(type == "today") {
      set(today_Keys.KEY_PV, pv);
      set(today_Keys.KEY_PV_SRC, src);
      set(today_Keys.KEY_CREATION, new Date().toJSON());
    } else if(type == "total") {
      set(total_Keys.KEY_PV, pv);
      set(total_Keys.KEY_PV_SRC, src);
      set(total_Keys.KEY_CREATION, new Date().toJSON());
    }
  }

  return {
    keysCount(type) {
      if(type == "today")
        return Object.keys(today_Keys).length;
      else if(type == "total")
        return Object.keys(total_Keys).length;
    },
    hasCache(type) {
      if(type == "today")
        return (localStorage.getItem(today_Keys.KEY_PV) !== null);
      else if(type == "total")
        return (localStorage.getItem(total_Keys.KEY_PV) !== null);
    },
    getCache(type) {
      if(type == "today")
        return JSON.parse(localStorage.getItem(today_Keys.KEY_PV));
      else if(type == "total")
        return JSON.parse(localStorage.getItem(total_Keys.KEY_PV));
    },
    saveProxyCache(type, pv) {
      saveCache(type, pv, Source.PROXY);
    },
    isExpired(type) {
      if(type == "today") {
        let date = new Date(get(today_Keys.KEY_CREATION));

        date.setHours(date.getHours() + 1);   // per hour
        return Date.now() >= date.getTime();
      } else if(type == "total") {
        let date = new Date(get(total_Keys.KEY_CREATION));

        date.setHours(date.getHours() + 1);   // per hour
        return Date.now() >= date.getTime();
      }
    },
    isFromLocal(type) {
      if(type == "today")
        return get(today_Keys.KEY_PV_SRC) === Source.LOCAL;
      else if(type == "total")
        return get(total_Keys.KEY_PV_SRC) === Source.LOCAL;
    },
    isFromProxy(type) {
      if(type == "today")
        return get(today_Keys.KEY_PV_SRC) === Source.PROXY;
      else if(type == "total")
        return get(total_Keys.KEY_PV_SRC) === Source.PROXY;
    },
    newerThan(type, pv) {
      return blogPvStorage.getCache(type).totalsForAllResults["ga:pageviews"] > pv.totalsForAllResults["ga:pageviews"];
    },
    inspectKeys(type) {
      if (localStorage.length !== blogPvStorage.keysCount(type)) {
        localStorage.clear();
        return;
      }
      if(type == "today") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          switch (key) {
            case today_Keys.KEY_PV:
            case today_Keys.KEY_PV_SRC:
            case today_Keys.KEY_CREATION:
              break;
            default:
              localStorage.clear();
              return;
          }
        }
      } else if(type == "total") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          switch (key) {
            case total_Keys.KEY_PV:
            case total_Keys.KEY_PV_SRC:
            case total_Keys.KEY_CREATION:
              break;
            default:
              localStorage.clear();
              return;
          }
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

function countBlogPV(rows) {
  let count = 0;

  if (typeof rows !== "undefined") {
    const temp = parseInt(rows[0][0], 10);

    count += temp;
  }

  return count;
}

function tackleBlogPV(type, rows, elem, hasInit) {
  let count = countBlogPV(rows);
  count = (count === 0 ? 1 : count); // if count is '0' then replace to '1' or just 'count'

  console.log("[" + type + "] hasInit is " + hasInit)

  if(!hasInit) {
    console.log("[" + type + "] InitStatusBlog = no");
    elem.text(new Intl.NumberFormat().format(count));
    console.log("[" + type + "] display pageview done.");
  } else {
    console.log("[" + type + "] InitStatusBlog = yes");
    const initCount = parseInt(elem.text().replace(/,/g, ""), 10);

    console.log("[" + type + "] initCount = " + initCount);

    if (count > initCount) {
      console.log("[" + type + "] count is > initcount");
      countUpBlog(initCount, count, elem.attr("id"));
    }
  }
}

function displayBlogPageviews(data) {
  if(typeof data === "undefined") {
    return;
  }

  const rows = data.rows;

  let type = data.query["start-date"];
  
  if(type == "today") {
    let hasInit = getInitStatusBlog.status(type);

    console.log("[" + type + "] displayBlogPageviews rows = " + rows[0]);
    tackleBlogPV(type, rows, $("#todayPV"), hasInit);
  } else {
    type = "total";

    let hasInit = getInitStatusBlog.status(type);

    console.log("[" + type + "] displayBlogPageviews rows = " + rows[0]);
    tackleBlogPV(type, rows, $("#totalPV"), hasInit);
  }
}

function fetchProxyBlogPageviews(type, callback) {
  $.ajax({
    type: "GET",
    url: getAPI_URL(type),
    dataType: "jsonp",
    jsonpCallback: "displayBlogPageviews",
    success: (data) => {
      blogPvStorage.saveProxyCache(type, JSON.stringify(data));
      console.log("[" + type + "] 2. save ProxyCache");
      callback(type);
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.log("[" + type + "] Failed today pageviews: " + errorThrown);
    }
  });
}

function getPageviews(type) {
  blogPvStorage.inspectKeys(type);

  if (blogPvStorage.hasCache(type)) { // has Cashe
    console.log("[" + type + "] 1. blogPvStorage.hasCashe = yes");
    displayBlogPageviews(blogPvStorage.getCache(type));

    if(type == "total") {
      console.log("[" + type + "] blogCount SUCCESS ! ! !");
    } else {
      console.log("[" + type + "] blogCount SUCCESS ! ! !");
      getPageviews("total");
    }

    if(blogPvStorage.isExpired(type)) {
      console.log("[" + type + "] There is expired");

      if(type == "total") {
        fetchProxyBlogPageviews(type, callback => { console.log("[" + type + "] fetch is done") });
      } else {
        fetchProxyBlogPageviews(type, callback => {
          console.log("[" + type + "] fetch is done");
          console.log("---------------------------------------------------------------");
          getPageviews("total");
        });
      }
    } else {
      console.log("[" + type + "] There is no expired");
      if (blogPvStorage.isFromLocal(type)) {
        console.log("[" + type + "] isFromLocal Yes");

        if(type == "total") {
          fetchProxyBlogPageviews(type, callback => { console.log("[" + type + "] fetch is done") });
        } else {
          fetchProxyBlogPageviews(type, callback => {
            console.log("[" + type + "] fetch is done");
            console.log("---------------------------------------------------------------");
            getPageviews("total");
          });
        }
      }
    }
  } else { // has not Cashe
    console.log("[" + type + "] 1. blogPvStorage.hasCashe = no");

    if(type == "total") {
        fetchProxyBlogPageviews(type, callback => { console.log("[" + type + "] fetch is done") });
      } else {
        fetchProxyBlogPageviews(type, callback => {
          console.log("[" + type + "] fetch is done");
          console.log("---------------------------------------------------------------");
          getPageviews("total");
        });
      }
  }
}

$(function () {
  getPageviews("today");
});
