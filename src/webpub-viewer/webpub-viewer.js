/*eslint-disable @typescript-eslint/no-unused-vars*/
/* eslint-disable @typescript-eslint/no-empty-function*/

(function () {
  let Annotator = {},
    BookFont = {},
    BookView = {},
    BookTheme = {},
    HTMLUtilities = {},
    Store = {},
    IconLib = {},
    BookSettings = {},
    BrowserUtilities = {},
    Cacher = {},
    PaginatedBookView = {},
    ColumnsPaginatedBookView = {},
    DayTheme = {},
    EventHandler = {},
    Navigator = {},
    PublisherFont = {},
    SerifFont = {},
    SansFont = {},
    SepiaTheme = {},
    NightTheme = {},
    ScrollingBookView = {},
    Manifest = {},
    IFrameNavigator = {},
    LocalAnnotator = {},
    MemoryStore = {},
    LocalStorageStore = {},
    ServiceWorkerCacher = {},
    app = {},
    index = {};
  const awaiter =
    (this && this.awaiter) ||
    function (thisArg, arguments, P, generator) {
      function adopt(value) {
        return value instanceof P
          ? value
          : new P(function (resolve) {
              resolve(value);
            });
      }
      return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done
            ? resolve(result.value)
            : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, arguments || [])).next());
      });
    };
  const generator =
    (this && this.generator) ||
    function (thisArg, body) {
      const  = {
          label: 0,
          sent: function () {
            if (t[0] & 1) throw t[1];
            return t[1];
          },
          trys: [],
          ops: []
        },
        f,
        y,
        t,
        g;
      return (
        (g = {
          next: verb(0),
          throw: verb(1),
          return: verb(2)
        }),
        typeof Symbol === "function" &&
          (g[Symbol.iterator] = function () {
            return this;
          }),
        g
      );
      function verb(n) {
        return function (v) {
          return step([n, v]);
        };
      }
      function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while ()
          try {
            if (
              ((f = 1),
              y &&
                (t =
                  op[0] & 2
                    ? y["return"]
                    : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
                !(t = t.call(y, op[1])).done)
            )
              return t;
            if (((y = 0), t)) op = [op[0] & 2, t.value];
            switch (op[0]) {
              case 0:
              case 1:
                t = op;
                break;
              case 4:
                .label++;
                return {
                  value: op[1],
                  done: false
                };
              case 5:
                .label++;
                y = op[1];
                op = [0];
                continue;
              case 7:
                op = .ops.pop();
                .trys.pop();
                continue;
              default:
                if (
                  !((t = .trys), (t = t.length > 0 && t[t.length - 1])) &&
                  (op[0] === 6 || op[0] === 2)
                ) {
                   = 0;
                  continue;
                }
                if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                  .label = op[1];
                  break;
                }
                if (op[0] === 6 && .label < t[1]) {
                  .label = t[1];
                  t = op;
                  break;
                }
                if (t && .label < t[2]) {
                  .label = t[2];
                  .ops.push(op);
                  break;
                }
                if (t[2]) .ops.pop();
                .trys.pop();
                continue;
            }
            op = body.call(thisArg, );
          } catch (e) {
            op = [6, e];
            y = 0;
          } finally {
            f = t = 0;
          }
        if (op[0] & 5) throw op[1];
        return {
          value: op[0] ? op[1] : void 0,
          done: true
        };
      }
    };
  Annotator = (function (exports) {
    Object.defineProperty(exports, "esModule", { value: true });
    return exports;
  })(Annotator);
  BookFont = (function (exports) {
    Object.defineProperty(exports, "esModule", { value: true });
    return exports;
  })(BookFont);
  BookView = (function (exports) {
    Object.defineProperty(exports, "esModule", { value: true });
    return exports;
  })(BookView);
  BookTheme = (function (exports) {
    Object.defineProperty(exports, "esModule", { value: true });
    return exports;
  })(BookTheme);
  HTMLUtilities = (function (exports) {
    Object.defineProperty(exports, "esModule", { value: true });
    /** Returns a single element matching the selector within the parentElement,
  or null if no element matches. */
    function findElement(parentElement, selector) {
      return parentElement.querySelector(selector);
    }
    exports.findElement = findElement;
    /** Returns a single element matching the selector within the parent element,
  or throws an exception if no element matches. */
    function findRequiredElement(parentElement, selector) {
      const element = findElement(parentElement, selector);
      if (!element) {
        throw "required element " + selector + " not found";
      } else {
        return element;
      }
    }
    exports.findRequiredElement = findRequiredElement;
    /** Returns a single element matching the selector within the parentElement in the iframe context,
  or null if no element matches. */
    function findIframeElement(parentElement, selector) {
      if (parentElement === null) {
        throw "parent element is null";
      } else {
        return parentElement.querySelector(selector);
      }
    }
    exports.findIframeElement = findIframeElement;
    /** Returns a single element matching the selector within the parent element in an iframe context,
  or throws an exception if no element matches. */
    function findRequiredIframeElement(parentElement, selector) {
      const element = findIframeElement(parentElement, selector);
      if (!element) {
        throw "required element " + selector + " not found in iframe";
      } else {
        return element;
      }
    }
    exports.findRequiredIframeElement = findRequiredIframeElement;
    /** Sets an attribute and its value for an HTML element */
    function setAttr(element, attr, value) {
      element.setAttribute(attr, value);
    }
    exports.setAttr = setAttr;
    /** Removes an attribute for an HTML element */
    function removeAttr(element, attr) {
      element.removeAttribute(attr);
    }
    exports.removeAttr = removeAttr;
    /** Creates an internal stylesheet in an HTML element */
    function createStylesheet(element, id, cssStyles) {
      const head = element.querySelector("head");
      const stylesheet = document.createElement("style");
      stylesheet.id = id;
      stylesheet.textContent = cssStyles;
      head.appendChild(stylesheet);
    }
    exports.createStylesheet = createStylesheet;
    /** Removes an existing internal stylesheet in an HTML element */
    function removeStylesheet(element, id) {
      const head = element.querySelector("head");
      const stylesheet = head.querySelector("#" + id);
      head.removeChild(stylesheet);
    }
    exports.removeStylesheet = removeStylesheet;
    return exports;
  })(HTMLUtilities);
  Store = (function (exports) {
    Object.defineProperty(exports, "esModule", { value: true });
    return exports;
  })(Store);
  IconLib = (function (exports) {
    Object.defineProperty(exports, "esModule", { value: true });
    exports.WIDTHATTR = 24;
    exports.HEIGHTATTR = 24;
    exports.VIEWBOXATTR = "0 0 25 25";
    const iconTemplate = function (id, title, path, classAttr) {
      if (classAttr === void 0) {
        classAttr = "icon";
      }
      return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="' +
        exports.WIDTHATTR +
        '" height="' +
        exports.HEIGHTATTR +
        '" viewBox="' +
        exports.VIEWBOXATTR +
        '" preserveAspectRatio="xMidYMid meet" role="img" class="' +
        classAttr +
        '" aria-labelledBy="' +
        id +
        '">\n  <title id="' +
        id +
        '">' +
        title +
        "</title>\n  " +
        path +
        "\n</svg>"
      );
    };
    const iconSymbol = function (id, title, path, classAttr) {
      if (classAttr === void 0) {
        classAttr = "svgIcon use";
      }
      return (
        '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" role="img" class="' +
        classAttr +
        '">\n  <defs>\n    <symbol id="' +
        id +
        '" viewBox="' +
        exports.VIEWBOXATTR +
        '">\n      <title>' +
        title +
        "</title>\n      " +
        path +
        "\n    </symbol>\n  </defs>\n</svg>"
      );
    };
    const iconUse = function (id, classAttr) {
      return (
        '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" class="' +
        classAttr +
        '" role="img" aria-labelledby="' +
        id +
        '">\n  <use xlink:href="#' +
        id +
        '"></use>\n</svg>'
      );
    };
    exports.icons = {
      checkOriginal: iconSymbol(
        "check-icon",
        "Checked",
        '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/>'
      ),
      checkDupe: iconUse("check-icon", "checkedIcon"),
      closeOriginal: iconSymbol(
        "close-icon",
        "Close",
        '<path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z"/>'
      ),
      closeDupe: iconUse("close-icon", "icon close inactive-icon"),
      error: iconTemplate(
        "error-icon",
        "Warning",
        '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>'
      ),
      home:
        '<path d="M13.048,8.85a4.934,4.934,0,0,1,.879.322,0.893,0.893,0,0,0,.475.263,0.771,0.771,0,0,0,.352-0.609,1.481,1.481,0,0,0-.076-0.837,1.18,1.18,0,0,0-1.119-.351,2.931,2.931,0,0,0-.773.123c-0.27.082-.644,0.263-0.486,0.638A1.2,1.2,0,0,0,13.048,8.85Z" />\n  <path d="M12.444,0A12.5,12.5,0,1,0,25,12.5,12.468,12.468,0,0,0,12.444,0ZM5.15,21.271a1.841,1.841,0,0,1-.457-0.562c-1.06-1.7-1.658-7.7-.287-9.746,0.434-.714.9-0.386,0.744,0.17a4.505,4.505,0,0,0,.5,3.278c0.949,2,3.873,4.771,4.646,5.777a7.852,7.852,0,0,1,1.764,3.319c-0.006.258-.059,0.427-0.516,0.386A11.339,11.339,0,0,1,5.15,21.271Zm18.344-5.7c-0.094.293-.205,0.661-0.445,0.492a10.744,10.744,0,0,0-2.39-1.317c-0.053-.012-0.047-0.082-0.029-0.123a1.67,1.67,0,0,0,.129-0.468,1.228,1.228,0,0,1,.228-0.41,4.186,4.186,0,0,0,.434-1.5,3.646,3.646,0,0,0-.07-1.188A2.7,2.7,0,0,1,21.2,10.53c0-.17.082-0.345,0.1-0.544a1.614,1.614,0,0,0-1.072-1.235c-0.9-.416-1.851-0.79-2.818-1.305a11.027,11.027,0,0,1-1.424-1.258,10.435,10.435,0,0,0-2.437-1.054,0.228,0.228,0,0,1-.193-0.193,5.677,5.677,0,0,0-2.127-3.3c-0.4-.31.047-0.486,0.6-0.515A11.389,11.389,0,0,1,23.494,15.57Zm-3.527-3.834c-0.006-.047-0.023-0.193-0.023-0.222a0.6,0.6,0,0,1,.24-0.246,2.091,2.091,0,0,1,.334-0.234c0.029-.018.053,0.023,0.059,0.035a3.181,3.181,0,0,1-.029,2.254c-0.029.059-.076,0.082-0.094,0.041a1.454,1.454,0,0,0-.492-0.615,0.115,0.115,0,0,1-.035-0.1A2.749,2.749,0,0,0,19.967,11.736ZM9.491,6.4a3.811,3.811,0,0,1,3.029-.433,13.8,13.8,0,0,1,2.15.784c0.685,0.316,1.172.9,1.81,1.247,0.8,0.445,1.91.656,2.76,1.071a0.8,0.8,0,0,1,.5.451,3.059,3.059,0,0,1-1.623-.023,0.524,0.524,0,0,0-.615.094,0.906,0.906,0,0,0,.059.749,0.979,0.979,0,0,0,.469.509c0.275,0.129.656,0.135,0.908,0.281a1.227,1.227,0,0,1,.182,1.6,2.206,2.206,0,0,1-1.746.4,5.289,5.289,0,0,0-2,.105,2.328,2.328,0,0,0-1.043,1,0.12,0.12,0,0,1-.17.023c-1.775-1.065-4.019-1.616-5.214-3.307a3.638,3.638,0,0,1-.58-1.528A3.018,3.018,0,0,1,9.491,6.4ZM6.72,3.214c-0.352-.041-0.357-0.3-0.205-0.4a8.284,8.284,0,0,1,1.623-.837A0.8,0.8,0,0,1,8.589,1.9a4.956,4.956,0,0,1,2.086.972c1.043,0.743,1.974,2.16,1.353,2.043a5.866,5.866,0,0,0-.68-0.1c-0.469-.041-0.779.006-1-0.018a0.434,0.434,0,0,1-.234-0.123A5.867,5.867,0,0,0,6.72,3.214Zm9.292,11.473a0.675,0.675,0,0,1,.3-0.41,3.043,3.043,0,0,1,1.242-.222,3.994,3.994,0,0,0,1.26-.2,0.773,0.773,0,0,1,.691-0.217,0.5,0.5,0,0,1,.264.322,1.25,1.25,0,0,1,.07.486,13.41,13.41,0,0,1-.58,1.352,0.451,0.451,0,0,1-.07.246,2.132,2.132,0,0,1-1.652.217,2.074,2.074,0,0,1-.592-0.1,1.145,1.145,0,0,1-.293-0.24,6.619,6.619,0,0,1-.51-0.544,0.851,0.851,0,0,1-.228-0.293A1.2,1.2,0,0,1,16.012,14.686ZM4.09,4.812a0.521,0.521,0,0,1,.27-0.17,6.908,6.908,0,0,1,4.365.369C8.982,5.128,9.1,5.286,8.929,5.4a8.935,8.935,0,0,0-1.236.89,0.562,0.562,0,0,1-.4.082,6.571,6.571,0,0,0-4.1.486C2.883,6.983,2.6,6.808,2.742,6.562A10.008,10.008,0,0,1,4.09,4.812Zm-2.818,5.45a0.49,0.49,0,0,1,.123-0.3,7.869,7.869,0,0,1,4.412-2.54,0.628,0.628,0,0,1,.644.111c0.1,0.24-.1.38-0.34,0.515-4.166,2.488-3.873,6.187-3.914,7.7,0.012,0.62-.434.732-0.545,0.439A10.877,10.877,0,0,1,1.271,10.261Zm5.25,2.909a4.944,4.944,0,0,1,.07-4c0.164-.31.322-0.509,0.533-0.451,0.228,0.064.281,0.293,0.311,0.726,0.228,3.565,2.39,4.771,5.1,6.029a15.622,15.622,0,0,1,6.615,5.368c0.311,0.439.352,0.7,0.006,0.954a11.145,11.145,0,0,1-4.019,1.826c-0.246.059-.5,0.012-0.727-0.55C12.122,17.168,8.279,17.437,6.521,13.17Zm14.19,7.252c-0.352.345-.545,0.076-0.662-0.146a10.28,10.28,0,0,0-1.734-2.745,0.178,0.178,0,0,1,.164-0.3,1.287,1.287,0,0,0,.691-0.111,1.383,1.383,0,0,0,.633-0.9c0.1-.339.1-0.445,0.311-0.462a0.632,0.632,0,0,1,.205.023,2.5,2.5,0,0,1,.732.433,6.868,6.868,0,0,1,1.412,1.539,0.4,0.4,0,0,1-.047.4A11.284,11.284,0,0,1,20.711,20.423Z" />',
      expand: iconTemplate(
        "expand-icon",
        "Enter fullscreen",
        '<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>',
        "icon active-icon"
      ),
      loading: iconTemplate(
        "loading-icon",
        "Loading",
        '<path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>'
      ),
      menu: iconTemplate(
        "menu-icon",
        "Show and hide navigation bar",
        '<path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/>',
        "icon menu open inactive-icon"
      ),
      minimize: iconTemplate(
        "minimize-icon",
        "Exit fullscreen",
        '<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>',
        "icon inactive-icon"
      ),
      next: iconTemplate(
        "next-icon",
        "Next Chapter",
        '<path d="M6.49 20.13l1.77 1.77 9.9-9.9-9.9-9.9-1.77 1.77L14.62 12l-8.13 8.13z"/>'
      ),
      previous: iconTemplate(
        "previous-icon",
        "Previous Chapter",
        '<path d="M17.51 3.87L15.73 2.1 5.84 12l9.9 9.9 1.77-1.77L9.38 12l8.13-8.13z"/>'
      ),
      settings: iconTemplate(
        "settings-icon",
        "Settings",
        '<path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>',
        "icon open"
      ),
      toc: iconTemplate(
        "toc-icon",
        "Table of Contents",
        '<path d="M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h14v-2H3v2zm16 0h2v-2h-2v2zm0-10v2h2V7h-2zm0 6h2v-2h-2v2z"/>',
        "icon open"
      )
    };
    return exports;
  })(IconLib);
  BookSettings = (function (exports, HTMLUtilities, IconLib) {
    Object.defineProperty(exports, "esModule", { value: true });
    const template = function (sections) {
      return (
        '\n    <ul class="settings-menu" role="menu">\n        ' +
        sections +
        "\n    </ul>\n"
      );
    };
    const sectionTemplate = function (options) {
      return (
        '\n    <li><ul class="settings-options">\n        ' +
        options +
        "\n    </ul></li>\n"
      );
    };
    const optionTemplate = function (
      liClassName,
      buttonClassName,
      label,
      role,
      svgIcon,
      buttonId
    ) {
      return (
        "\n    <li class='" +
        liClassName +
        "'><button id='" +
        buttonId +
        "' class='" +
        buttonClassName +
        "' role='" +
        role +
        "' tabindex=-1>" +
        label +
        svgIcon +
        "</button></li>\n"
      );
    };
    const offlineTemplate =
      "\n    <li>\n        <div class='offline-status'></div>\n    </li>\n";
    const BookSettings = (function () {
      function BookSettings(
        store,
        bookFonts,
        fontSizes,
        bookThemes,
        bookViews
      ) {
        this.fontChangeCallback = function () {};
        this.fontSizeChangeCallback = function () {};
        this.themeChangeCallback = function () {};
        this.viewChangeCallback = function () {};
        this.store = store;
        this.bookFonts = bookFonts;
        this.fontSizes = fontSizes;
        this.bookThemes = bookThemes;
        this.bookViews = bookViews;
      }
      BookSettings.create = function (config) {
        return awaiter(this, void 0, void 0, function () {
          const fontSizes, settings;
          return generator(this, function (a) {
            switch (a.label) {
              case 0:
                fontSizes = config.fontSizesInPixels.map(function (fontSize) {
                  return fontSize + "px";
                });
                settings = new this(
                  config.store,
                  config.bookFonts,
                  fontSizes,
                  config.bookThemes,
                  config.bookViews
                );
                return [
                  4,
                  settings.initializeSelections(
                    config.defaultFontSizeInPixels
                      ? config.defaultFontSizeInPixels + "px"
                      : undefined
                  )
                ];
              case 1:
                a.sent();
                return [2, settings];
            }
          });
        });
      };
      BookSettings.prototype.initializeSelections = function (defaultFontSize) {
        return awaiter(this, void 0, void 0, function () {
          const selectedFont,
            selectedFontName,
            i,
            a,
            bookFont,
            selectedFontSize,
            selectedFontSizeIsAvailable,
            averageFontSizeIndex,
            selectedTheme,
            selectedThemeName,
            b,
            c,
            bookTheme,
            selectedView,
            selectedViewName,
            d,
            e,
            bookView;
          return generator(this, function (f) {
            switch (f.label) {
              case 0:
                if (!(this.bookFonts.length >= 1)) return [3, 2];
                selectedFont = this.bookFonts[0];
                return [4, this.store.get(BookSettings.SELECTEDFONTKEY)];
              case 1:
                selectedFontName = f.sent();
                if (selectedFontName) {
                  for (i = 0, a = this.bookFonts; i < a.length; i++) {
                    bookFont = a[i];
                    if (bookFont.name === selectedFontName) {
                      selectedFont = bookFont;
                      break;
                    }
                  }
                }
                this.selectedFont = selectedFont;
                f.label = 2;
              case 2:
                if (!(this.fontSizes.length >= 1)) return [3, 4];
                return [4, this.store.get(BookSettings.SELECTEDFONTSIZEKEY)];
              case 3:
                selectedFontSize = f.sent();
                selectedFontSizeIsAvailable =
                  selectedFontSize &&
                  this.fontSizes.indexOf(selectedFontSize) !== -1;
                // If not, or the user selected a size that's no longer an option, is there a default font size?
                if (
                  (!selectedFontSize || !selectedFontSizeIsAvailable) &&
                  defaultFontSize
                ) {
                  selectedFontSize = defaultFontSize;
                  selectedFontSizeIsAvailable =
                    selectedFontSize &&
                    this.fontSizes.indexOf(selectedFontSize) !== -1;
                }
                // If there's no selection and no default, pick a font size in the middle of the options.
                if (!selectedFontSize || !selectedFontSizeIsAvailable) {
                  averageFontSizeIndex = Math.floor(this.fontSizes.length / 2);
                  selectedFontSize = this.fontSizes[averageFontSizeIndex];
                }
                this.selectedFontSize = selectedFontSize;
                f.label = 4;
              case 4:
                if (!(this.bookThemes.length >= 1)) return [3, 6];
                selectedTheme = this.bookThemes[0];
                return [4, this.store.get(BookSettings.SELECTEDTHEMEKEY)];
              case 5:
                selectedThemeName = f.sent();
                if (selectedThemeName) {
                  for (b = 0, c = this.bookThemes; b < c.length; b++) {
                    bookTheme = c[b];
                    if (bookTheme.name === selectedThemeName) {
                      selectedTheme = bookTheme;
                      break;
                    }
                  }
                }
                this.selectedTheme = selectedTheme;
                f.label = 6;
              case 6:
                if (!(this.bookViews.length >= 1)) return [3, 8];
                selectedView = this.bookViews[0];
                return [4, this.store.get(BookSettings.SELECTEDVIEWKEY)];
              case 7:
                selectedViewName = f.sent();
                if (selectedViewName) {
                  for (d = 0, e = this.bookViews; d < e.length; d++) {
                    bookView = e[d];
                    if (bookView.name === selectedViewName) {
                      selectedView = bookView;
                      break;
                    }
                  }
                }
                this.selectedView = selectedView;
                f.label = 8;
              case 8:
                return [2];
            }
          });
        });
      };
      BookSettings.prototype.renderControls = function (element) {
        const sections = [];
        if (this.bookFonts.length > 1) {
          const fontOptions = this.bookFonts.map(function (bookFont) {
            return optionTemplate(
              "reading-style",
              bookFont.name,
              bookFont.label,
              "menuitem",
              IconLib.icons.checkDupe,
              bookFont.label
            );
          });
          sections.push(sectionTemplate(fontOptions.join("")));
        }
        if (this.fontSizes.length > 1) {
          const fontSizeOptions =
            optionTemplate(
              "font-setting",
              "decrease",
              "A-",
              "menuitem",
              "",
              "decrease-font"
            ) +
            optionTemplate(
              "font-setting",
              "increase",
              "A+",
              "menuitem",
              "",
              "increase-font"
            );
          sections.push(sectionTemplate(fontSizeOptions));
        }
        if (this.bookThemes.length > 1) {
          const themeOptions = this.bookThemes.map(function (bookTheme) {
            return optionTemplate(
              "reading-theme",
              bookTheme.name,
              bookTheme.label,
              "menuitem",
              IconLib.icons.checkDupe,
              bookTheme.label
            );
          });
          sections.push(sectionTemplate(themeOptions.join("")));
        }
        if (this.bookViews.length > 1) {
          const viewOptions = this.bookViews.map(function (bookView) {
            return optionTemplate(
              "reading-style",
              bookView.name,
              bookView.label,
              "menuitem",
              IconLib.icons.checkDupe,
              bookView.label
            );
          });
          sections.push(sectionTemplate(viewOptions.join("")));
        }
        sections.push(offlineTemplate);
        element.innerHTML = template(sections.join(""));
        this.fontButtons = {};
        if (this.bookFonts.length > 1) {
          for (const i = 0, a = this.bookFonts; i < a.length; i++) {
            const bookFont = a[i];
            this.fontButtons[bookFont.name] = HTMLUtilities.findRequiredElement(
              element,
              "button[class=" + bookFont.name + "]"
            );
          }
          this.updateFontButtons();
        }
        this.fontSizeButtons = {};
        if (this.fontSizes.length > 1) {
          for (
            const b = 0, c = ["decrease", "increase"];
            b < c.length;
            b++
          ) {
            const fontSizeName = c[b];
            this.fontSizeButtons[
              fontSizeName
            ] = HTMLUtilities.findRequiredElement(
              element,
              "button[class=" + fontSizeName + "]"
            );
          }
          this.updateFontSizeButtons();
        }
        this.themeButtons = {};
        if (this.bookThemes.length > 1) {
          for (const d = 0, e = this.bookThemes; d < e.length; d++) {
            const bookTheme = e[d];
            this.themeButtons[
              bookTheme.name
            ] = HTMLUtilities.findRequiredElement(
              element,
              "button[class=" + bookTheme.name + "]"
            );
          }
          this.updateThemeButtons();
        }
        this.viewButtons = {};
        if (this.bookViews.length > 1) {
          for (const f = 0, g = this.bookViews; f < g.length; f++) {
            const bookView = g[f];
            this.viewButtons[bookView.name] = HTMLUtilities.findRequiredElement(
              element,
              "button[class=" + bookView.name + "]"
            );
          }
          this.updateViewButtons();
        }
        this.offlineStatusElement = HTMLUtilities.findRequiredElement(
          element,
          'div[class="offline-status"]'
        );
        this.setupEvents();
        // Clicking the settings view outside the ul hides it, but clicking inside the ul keeps it up.
        HTMLUtilities.findRequiredElement(element, "ul").addEventListener(
          "click",
          function (event) {
            event.stopPropagation();
          }
        );
      };
      BookSettings.prototype.onFontChange = function (callback) {
        this.fontChangeCallback = callback;
      };
      BookSettings.prototype.onFontSizeChange = function (callback) {
        this.fontSizeChangeCallback = callback;
      };
      BookSettings.prototype.onThemeChange = function (callback) {
        this.themeChangeCallback = callback;
      };
      BookSettings.prototype.onViewChange = function (callback) {
        this.viewChangeCallback = callback;
      };
      BookSettings.prototype.setupEvents = function () {
        const this = this;
        const loop1 = function (font) {
          const button = this1.fontButtons[font.name];
          if (button) {
            button.addEventListener("click", function (event) {
              this.selectedFont.stop();
              font.start();
              this.selectedFont = font;
              this.updateFontButtons();
              this.storeSelectedFont(font);
              this.fontChangeCallback();
              event.preventDefault();
            });
          }
        };
        const this1 = this;
        for (const i = 0, a = this.bookFonts; i < a.length; i++) {
          const font = a[i];
          loop1(font);
        }
        if (this.fontSizes.length > 1) {
          this.fontSizeButtons["decrease"].addEventListener("click", function (
            event
          ) {
            const currentFontSizeIndex = this.fontSizes.indexOf(
              this.selectedFontSize
            );
            if (currentFontSizeIndex > 0) {
              const newFontSize = this.fontSizes[currentFontSizeIndex - 1];
              this.selectedFontSize = newFontSize;
              this.fontSizeChangeCallback();
              this.updateFontSizeButtons();
              this.storeSelectedFontSize(newFontSize);
            }
            event.preventDefault();
          });
          this.fontSizeButtons["increase"].addEventListener("click", function (
            event
          ) {
            const currentFontSizeIndex = this.fontSizes.indexOf(
              this.selectedFontSize
            );
            if (currentFontSizeIndex < this.fontSizes.length - 1) {
              const newFontSize = this.fontSizes[currentFontSizeIndex + 1];
              this.selectedFontSize = newFontSize;
              this.fontSizeChangeCallback();
              this.updateFontSizeButtons();
              this.storeSelectedFontSize(newFontSize);
            }
            event.preventDefault();
          });
        }
        const loop2 = function (theme) {
          const button = this2.themeButtons[theme.name];
          if (button) {
            button.addEventListener("click", function (event) {
              this.selectedTheme.stop();
              theme.start();
              this.selectedTheme = theme;
              this.updateThemeButtons();
              this.storeSelectedTheme(theme);
              this.themeChangeCallback();
              event.preventDefault();
            });
          }
        };
        const this2 = this;
        for (const b = 0, c = this.bookThemes; b < c.length; b++) {
          const theme = c[b];
          loop2(theme);
        }
        const loop3 = function (view) {
          const button = this3.viewButtons[view.name];
          if (button) {
            button.addEventListener("click", function (event) {
              const position = this.selectedView.getCurrentPosition();
              this.selectedView.stop();
              view.start(position);
              this.selectedView = view;
              this.updateViewButtons();
              this.storeSelectedView(view);
              this.viewChangeCallback();
              event.preventDefault();
            });
          }
        };
        const this3 = this;
        for (const d = 0, e = this.bookViews; d < e.length; d++) {
          const view = e[d];
          loop3(view);
        }
      };
      BookSettings.prototype.updateFontButtons = function () {
        for (const i = 0, a = this.bookFonts; i < a.length; i++) {
          const font = a[i];
          if (font === this.selectedFont) {
            this.fontButtons[font.name].className = font.name + " active";
            this.fontButtons[font.name].setAttribute(
              "aria-label",
              font.label + " font enabled"
            );
          } else {
            this.fontButtons[font.name].className = font.name;
            this.fontButtons[font.name].setAttribute(
              "aria-label",
              font.label + " font disabled"
            );
          }
        }
      };
      BookSettings.prototype.updateFontSizeButtons = function () {
        const currentFontSizeIndex = this.fontSizes.indexOf(
          this.selectedFontSize
        );
        if (currentFontSizeIndex === 0) {
          this.fontSizeButtons["decrease"].className = "decrease disabled";
        } else {
          this.fontSizeButtons["decrease"].className = "decrease";
        }
        if (currentFontSizeIndex === this.fontSizes.length - 1) {
          this.fontSizeButtons["increase"].className = "increase disabled";
        } else {
          this.fontSizeButtons["increase"].className = "increase";
        }
      };
      BookSettings.prototype.updateThemeButtons = function () {
        for (const i = 0, a = this.bookThemes; i < a.length; i++) {
          const theme = a[i];
          if (theme === this.selectedTheme) {
            this.themeButtons[theme.name].className = theme.name + " active";
            this.themeButtons[theme.name].setAttribute(
              "aria-label",
              theme.label + " mode enabled"
            );
          } else {
            this.themeButtons[theme.name].className = theme.name;
            this.themeButtons[theme.name].setAttribute(
              "aria-label",
              theme.label + " mode disabled"
            );
          }
        }
      };
      BookSettings.prototype.updateViewButtons = function () {
        for (const i = 0, a = this.bookViews; i < a.length; i++) {
          const view = a[i];
          if (view === this.selectedView) {
            this.viewButtons[view.name].className = view.name + " active";
            this.viewButtons[view.name].setAttribute(
              "aria-label",
              view.label + " mode enabled"
            );
          } else {
            this.viewButtons[view.name].className = view.name;
            this.viewButtons[view.name].setAttribute(
              "aria-label",
              view.label + " mode disabled"
            );
          }
        }
      };
      BookSettings.prototype.getSelectedFont = function () {
        return this.selectedFont;
      };
      BookSettings.prototype.getSelectedFontSize = function () {
        return this.selectedFontSize;
      };
      BookSettings.prototype.getSelectedTheme = function () {
        return this.selectedTheme;
      };
      BookSettings.prototype.getSelectedView = function () {
        return this.selectedView;
      };
      BookSettings.prototype.getOfflineStatusElement = function () {
        return this.offlineStatusElement;
      };
      BookSettings.prototype.storeSelectedFont = function (font) {
        return awaiter(this, void 0, void 0, function () {
          return generator(this, function (a) {
            return [
              2,
              this.store.set(BookSettings.SELECTEDFONTKEY, font.name)
            ];
          });
        });
      };
      BookSettings.prototype.storeSelectedFontSize = function (fontSize) {
        return awaiter(this, void 0, void 0, function () {
          return generator(this, function (a) {
            return [
              2,
              this.store.set(BookSettings.SELECTEDFONTSIZEKEY, fontSize)
            ];
          });
        });
      };
      BookSettings.prototype.storeSelectedTheme = function (theme) {
        return awaiter(this, void 0, void 0, function () {
          return generator(this, function (a) {
            return [
              2,
              this.store.set(BookSettings.SELECTEDTHEMEKEY, theme.name)
            ];
          });
        });
      };
      BookSettings.prototype.storeSelectedView = function (view) {
        return awaiter(this, void 0, void 0, function () {
          return generator(this, function (a) {
            return [
              2,
              this.store.set(BookSettings.SELECTEDVIEWKEY, view.name)
            ];
          });
        });
      };
      BookSettings.SELECTEDFONTKEY = "settings-selected-font";
      BookSettings.SELECTEDFONTSIZEKEY = "settings-selected-font-size";
      BookSettings.SELECTEDTHEMEKEY = "settings-selected-theme";
      BookSettings.SELECTEDVIEWKEY = "settings-selected-view";
      return BookSettings;
    })();
    exports.default = BookSettings;
    return exports;
  })(BookSettings, HTMLUtilities, IconLib);
  BrowserUtilities = (function (exports) {
    Object.defineProperty(exports, "esModule", { value: true });
    /** Returns the current width of the document. */
    function getWidth() {
      return document.documentElement.clientWidth;
    }
    exports.getWidth = getWidth;
    /** Returns the current height of the document. */
    function getHeight() {
      return document.documentElement.clientHeight;
    }
    exports.getHeight = getHeight;
    /** Returns true if the browser is zoomed in with pinch-to-zoom on mobile. */
    function isZoomed() {
      return getWidth() !== window.innerWidth;
    }
    exports.isZoomed = isZoomed;
    return exports;
  })(BrowserUtilities);
  Cacher = (function (exports) {
    Object.defineProperty(exports, "esModule", { value: true });
    const CacheStatus;
    (function (CacheStatus) {
      /** The book has not been cached. */
      CacheStatus[(CacheStatus["Uncached"] = 0)] = "Uncached";
      /** There is a new version available (Application Cache only - refresh the page to update). */
      CacheStatus[(CacheStatus["UpdateAvailable"] = 1)] = "UpdateAvailable";
      /** The app is checking for a new version (Application Cache only). */
      CacheStatus[(CacheStatus["CheckingForUpdate"] = 2)] = "CheckingForUpdate";
      /** The cache is downloading. */
      CacheStatus[(CacheStatus["Downloading"] = 3)] = "Downloading";
      /** The cache is fully downloaded and the book is available offline. */
      CacheStatus[(CacheStatus["Downloaded"] = 4)] = "Downloaded";
      /** There was an error downloading the cache, and the book is not available offline. */
      CacheStatus[(CacheStatus["Error"] = 5)] = "Error";
    })((CacheStatus = exports.CacheStatus || (exports.CacheStatus = {})));
    return exports;
  })(Cacher);
  PaginatedBookView = (function (exports) {
    Object.defineProperty(exports, "esModule", { value: true });
    return exports;
  })(PaginatedBookView);
  ColumnsPaginatedBookView = (function (exports, HTMLUtilities) {
    Object.defineProperty(exports, "esModule", { value: true });
    // import * as BrowserUtilities from "./BrowserUtilities";
    const ColumnsPaginatedBookView = (function () {
      function ColumnsPaginatedBookView() {
        this.name = "columns-paginated-view";
        this.label = "Paginated";
        this.sideMargin = 0;
        this.height = 0;
        this.hasFixedScrollWidth = false;
      }
      ColumnsPaginatedBookView.prototype.start = function (position) {
        // any is necessary because CSSStyleDeclaration type does not include
        // all the vendor-prefixed attributes.
        const body = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "body"
        );
        body.style.webkitColumnCount = "1";
        body.style.MozColumnCount = "1";
        body.style.columnCount = "1";
        body.style.webkitColumnFill = "auto";
        body.style.MozColumnFill = "auto";
        body.style.columnFill = "auto";
        body.style.overflow = "hidden";
        body.style.position = "relative";
        body.style.webkitFontSmoothing = "subpixel-antialiased";
        this.setSize();
        const viewportElement = document.createElement("meta");
        viewportElement.name = "viewport";
        viewportElement.content =
          "width=device-width, initial-scale=1, maximum-scale=1";
        const head = HTMLUtilities.findIframeElement(
          this.bookElement.contentDocument,
          "head"
        );
        if (head) {
          head.appendChild(viewportElement);
        }
        this.checkForFixedScrollWidth();
        this.goToPosition(position);
        // This is delayed to prevent a bug in iOS 10.3 that causes
        // the top links to be displayed in the middle of the page.
        setTimeout(function () {
          document.body.style.overflow = "hidden";
          // This prevents overscroll/bouncing on iOS.
          document.body.style.position = "fixed";
          document.body.style.left = "0";
          document.body.style.right = "0";
          document.body.style.top = "0";
          document.body.style.bottom = "0";
        }, 0);
      };
      ColumnsPaginatedBookView.prototype.checkForFixedScrollWidth = function () {
        // Determine if the scroll width changes when the left position
        // changes. This differs across browsers and sometimes across
        // books in the same browser.
        const body = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "body"
        );
        const originalLeft = (body.style.left || "0px").slice(0, -2);
        const originalScrollWidth = body.scrollWidth;
        body.style.left = originalLeft - 1 + "px";
        this.hasFixedScrollWidth = body.scrollWidth === originalScrollWidth;
        body.style.left = originalLeft + "px";
      };
      // Get available width for iframe container to sit within
      ColumnsPaginatedBookView.prototype.getAvailableWidth = function () {
        const prevBtn = document.getElementById("prev-page-btn");
        const prevBtnWidth = 0;
        if (prevBtn) {
          const rect = prevBtn.getBoundingClientRect();
          prevBtnWidth = rect.width;
        }
        const nextBtn = document.getElementById("next-page-btn");
        const nextBtnWidth = 0;
        if (nextBtn) {
          const rect = nextBtn.getBoundingClientRect();
          nextBtnWidth = rect.width;
        }
        return window.innerWidth - prevBtnWidth - nextBtnWidth;
      };
      ColumnsPaginatedBookView.prototype.getAvailableHeight = function () {
        const topBar = document.getElementById("top-control-bar");
        const topHeight = 0;
        if (topBar) {
          const topRect = topBar.getBoundingClientRect();
          topHeight = topRect.height;
        }
        const bottomBar = document.getElementById("bottom-control-bar");
        const bottomHeight = 0;
        if (bottomBar) {
          const bottomRect = bottomBar.getBoundingClientRect();
          bottomHeight = bottomRect.height;
        }
        return window.innerHeight - topHeight - bottomHeight;
      };
      ColumnsPaginatedBookView.prototype.setSize = function () {
        // any is necessary because CSSStyleDeclaration type does not include
        // all the vendor-prefixed attributes.
        const body = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "body"
        );
        const width = this.getAvailableWidth() + "px";
        body.style.columnWidth = width;
        body.style.webkitColumnWidth = width;
        body.style.MozColumnWidth = width;
        body.style.columnGap = this.sideMargin * 2 + "px";
        body.style.webkitColumnGap = this.sideMargin * 2 + "px";
        body.style.MozColumnGap = this.sideMargin * 2 + "px";
        body.style.height = this.getAvailableHeight() + "px";
        body.style.width = width;
        body.style.marginLeft = this.sideMargin + "px";
        body.style.marginRight = this.sideMargin + "px";
        this.bookElement.contentDocument.documentElement.style.height =
          this.getAvailableHeight() + "px";
        this.bookElement.style.height = this.getAvailableHeight() + "px";
        this.bookElement.style.width = width;
        const images = body.querySelectorAll("img");
        for (const i = 0, images1 = images; i < images1.length; i++) {
          const image = images1[i];
          image.style.maxWidth = "100%";
          // Determine how much vertical space there is for the image.
          const nextElement = image;
          const totalMargins = 0;
          while (nextElement !== body) {
            const computedStyle = window.getComputedStyle(nextElement);
            if (computedStyle.marginTop) {
              totalMargins += parseInt(
                computedStyle.marginTop.slice(0, -2),
                10
              );
            }
            if (computedStyle.marginBottom) {
              totalMargins += parseInt(
                computedStyle.marginBottom.slice(0, -2),
                10
              );
            }
            nextElement = nextElement.parentElement;
          }
          image.style.maxHeight =
            this.getAvailableHeight() - totalMargins + "px";
          // Without this, an image at the end of a resource can end up
          // with an extra empty column after it.
          image.style.verticalAlign = "top";
        }
      };
      ColumnsPaginatedBookView.prototype.stop = function () {
        document.body.style.overflow = "auto";
        document.body.style.position = "static";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.top = "";
        document.body.style.bottom = "";
        const body = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "body"
        );
        body.style.columnCount = "";
        body.style.webkitColumnCount = "";
        body.style.MozColumnCount = "";
        body.style.columnGap = "";
        body.style.webkitColumnGap = "";
        body.style.MozColumnGap = "";
        body.style.columnFill = "";
        body.style.webkitColumnFill = "";
        body.style.MozColumnFill = "";
        body.style.overflow = "";
        body.style.position = "";
        body.style.webkitFontSmoothing = "";
        body.style.columnWidth = "";
        body.style.webkitColumnWidth = "";
        body.style.MozColumnWidth = "";
        body.style.height = "";
        body.style.width = "";
        body.style.marginLeft = "";
        body.style.marginRight = "";
        body.style.marginTop = "";
        body.style.marginBottom = "";
        this.bookElement.contentDocument.documentElement.style.height = "";
        this.bookElement.style.height = "";
        this.bookElement.style.width = "";
        const images = body.querySelectorAll("img");
        for (const i = 0, images2 = images; i < images2.length; i++) {
          const image = images2[i];
          image.style.maxWidth = "";
          image.style.maxHeight = "";
          image.style.display = "";
          image.style.marginLeft = "";
          image.style.marginRight = "";
        }
      };
      /** Returns the total width of the columns that are currently
      positioned to the left of the iframe viewport. */
      ColumnsPaginatedBookView.prototype.getLeftColumnsWidth = function () {
        const body = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "body"
        );
        const isFirefox =
          navigator.userAgent.toLowerCase().indexOf("firefox") !== -1;
        const isXML = this.bookElement.src.indexOf(".xml") !== -1;
        if (isFirefox && isXML) {
          // Feedbooks epubs have resources with .xml file extensions for historical
          // reasons. Firefox handles these differently than XHTML files, and setting
          // a left position as well as overflow:hidden causes the pages to be blank.
          return body.scrollLeft;
        }
        return -(body.style.left || "0px").slice(0, -2);
      };
      /** Returns the total width of the columns that are currently
      positioned to the right of the iframe viewport. */
      ColumnsPaginatedBookView.prototype.getRightColumnsWidth = function () {
        // scrollWidth includes the column in the iframe viewport as well as
        // columns to the right.
        const body = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "body"
        );
        const scrollWidth = body.scrollWidth;
        const width = this.getColumnWidth();
        const rightWidth = scrollWidth + this.sideMargin - width;
        if (this.hasFixedScrollWidth) {
          // In some browsers (IE and Firefox with certain books),
          // scrollWidth doesn't change when some columns
          // are off to the left, so we need to subtract them.
          const leftWidth = this.getLeftColumnsWidth();
          rightWidth = Math.max(0, rightWidth - leftWidth);
        }
        if (rightWidth === this.sideMargin) {
          return 0;
        } else {
          return rightWidth;
        }
      };
      /** Returns the width of one column. */
      ColumnsPaginatedBookView.prototype.getColumnWidth = function () {
        const body = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "body"
        );
        return body.offsetWidth + this.sideMargin * 2;
      };
      /** Shifts the columns so that the specified width is positioned
      to the left of the iframe viewport. */
      ColumnsPaginatedBookView.prototype.setLeftColumnsWidth = function (
        width
      ) {
        const body = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "body"
        );
        const isFirefox =
          navigator.userAgent.toLowerCase().indexOf("firefox") !== -1;
        const isXML = this.bookElement.src.indexOf(".xml") !== -1;
        if (isFirefox && isXML) {
          // Feedbooks epubs have resources with .xml file extensions for historical
          // reasons. Firefox handles these differently than XHTML files, and setting
          // a left position as well as overflow:hidden causes the pages to be blank.
          body.scrollLeft = width;
        } else {
          body.style.left = -width + "px";
        }
      };
      /** Returns number in range [0..1) representing the
      proportion of columns that are currently positioned
      to the left of the iframe viewport. */
      ColumnsPaginatedBookView.prototype.getCurrentPosition = function () {
        const width = this.getColumnWidth();
        const leftWidth = this.getLeftColumnsWidth();
        const rightWidth = this.getRightColumnsWidth();
        const totalWidth = leftWidth + width + rightWidth;
        return leftWidth / totalWidth;
      };
      /** Returns the current 1-indexed page number. */
      ColumnsPaginatedBookView.prototype.getCurrentPage = function () {
        return this.getCurrentPosition() * this.getPageCount() + 1;
      };
      /** Returns the total number of pages. */
      ColumnsPaginatedBookView.prototype.getPageCount = function () {
        const width = this.getColumnWidth();
        const leftWidth = this.getLeftColumnsWidth();
        const rightWidth = this.getRightColumnsWidth();
        const totalWidth = leftWidth + width + rightWidth;
        return totalWidth / width;
      };
      ColumnsPaginatedBookView.prototype.onFirstPage = function () {
        const leftWidth = this.getLeftColumnsWidth();
        return leftWidth <= 0;
      };
      ColumnsPaginatedBookView.prototype.onLastPage = function () {
        const rightWidth = this.getRightColumnsWidth();
        return rightWidth <= 0;
      };
      ColumnsPaginatedBookView.prototype.goToPreviousPage = function () {
        const leftWidth = this.getLeftColumnsWidth();
        const width = this.getColumnWidth();
        this.setLeftColumnsWidth(leftWidth - width);
      };
      ColumnsPaginatedBookView.prototype.goToNextPage = function () {
        const leftWidth = this.getLeftColumnsWidth();
        const width = this.getColumnWidth();
        this.setLeftColumnsWidth(leftWidth + width);
      };
      /** Goes to a position specified by a number in the range [0..1].
      The position should be a number as returned by getCurrentPosition,
      or 1 to go to the last page. The position will be rounded down so
      it matches the position of one of the columns. */
      /** @param position Number in range [0..1] */
      ColumnsPaginatedBookView.prototype.goToPosition = function (position) {
        this.setSize();
        // If the window has changed size since the columns were set up,
        // we need to reset position so we can determine the new total width.
        this.setLeftColumnsWidth(0);
        const width = this.getColumnWidth();
        const rightWidth = this.getRightColumnsWidth();
        const totalWidth = width + rightWidth;
        const newLeftWidth = position * totalWidth;
        // Round the new left width so it's a multiple of the column width.
        const roundedLeftWidth = Math.round(newLeftWidth / width) * width;
        if (roundedLeftWidth >= totalWidth) {
          // We've gone too far and all the columns are off to the left.
          // Move one column back into the viewport.
          roundedLeftWidth = roundedLeftWidth - width;
        }
        this.setLeftColumnsWidth(roundedLeftWidth);
      };
      ColumnsPaginatedBookView.prototype.goToElement = function (
        elementId,
        relative
      ) {
        const element = this.bookElement.contentDocument.getElementById(
          elementId
        );
        if (element) {
          // Get the element's position in the iframe, and
          // round that to figure out the column it's in.
          // There is a bug in Safari when using getBoundingClientRect
          // on an element that spans multiple columns. Temporarily
          // set the element's height to fit it on one column so we
          // can determine the first column position.
          const originalHeight = element.style.height;
          element.style.height = "0";
          const left = element.getBoundingClientRect().left;
          const width = this.getColumnWidth();
          const roundedLeftWidth = Math.floor(left / width) * width;
          if (relative) {
            const origin1 = this.getLeftColumnsWidth();
            roundedLeftWidth = Math.floor(left / width) * width + origin1;
          }
          // Restore element's original height.
          element.style.height = originalHeight;
          this.setLeftColumnsWidth(roundedLeftWidth);
        }
      };
      return ColumnsPaginatedBookView;
    })();
    exports.default = ColumnsPaginatedBookView;
    return exports;
  })(ColumnsPaginatedBookView, HTMLUtilities);
  DayTheme = (function (exports, HTMLUtilities) {
    Object.defineProperty(exports, "esModule", { value: true });
    const DayTheme = (function () {
      function DayTheme() {
        this.name = "day-theme";
        this.label = "Day";
      }
      DayTheme.prototype.start = function () {
        const rootElement = document.documentElement;
        HTMLUtilities.setAttr(rootElement, "data-viewer-theme", "day");
      };
      DayTheme.prototype.stop = function () {
        const rootElement = document.documentElement;
        HTMLUtilities.removeAttr(rootElement, "data-viewer-theme");
      };
      return DayTheme;
    })();
    exports.default = DayTheme;
    return exports;
  })(DayTheme, HTMLUtilities);
  EventHandler = (function (exports, BrowserUtilities) {
    Object.defineProperty(exports, "esModule", { value: true });
    const EventHandler = (function () {
      function EventHandler() {
        const this = this;
        this.pendingMouseEventStart = null;
        this.pendingMouseEventEnd = null;
        this.pendingTouchEventStart = null;
        this.pendingTouchEventEnd = null;
        this.onLeftTap = function () {};
        this.onMiddleTap = function () {};
        this.onRightTap = function () {};
        this.onBackwardSwipe = function () {};
        this.onForwardSwipe = function () {};
        this.onLeftArrow = function () {};
        this.onRightArrow = function () {};
        this.onLeftHover = function () {};
        this.onRightHover = function () {};
        this.onRemoveHover = function () {};
        this.onInternalLink = function () {};
        this.handleMouseEventStart = function (event) {
          this.pendingMouseEventStart = event;
        };
        this.handleTouchEventStart = function (event) {
          if (BrowserUtilities.isZoomed()) {
            return;
          }
          if (event.changedTouches.length !== 1) {
            // This is a multi-touch event. Ignore.
            return;
          }
          this.pendingTouchEventStart = event;
        };
        this.handleMouseEventEnd = function (event) {
          if (!this.pendingMouseEventStart) {
            // Somehow we got an end event without a start event. Ignore it.
            return;
          }
          const devicePixelRatio = window.devicePixelRatio;
          const xDevicePixels =
            (this.pendingMouseEventStart.clientX - event.clientX) /
            devicePixelRatio;
          const yDevicePixels =
            (this.pendingMouseEventStart.clientY - event.clientY) /
            devicePixelRatio;
          // Is the end event in the same place as the start event?
          if (
            Math.abs(xDevicePixels) < EventHandler.CLICKPIXELTOLERANCE &&
            Math.abs(yDevicePixels) < EventHandler.CLICKPIXELTOLERANCE
          ) {
            if (this.pendingMouseEventEnd) {
              // This was a double click. Let the browser handle it.
              this.pendingMouseEventStart = null;
              this.pendingMouseEventEnd = null;
              return;
            }
            // This was a single click.
            this.pendingMouseEventStart = null;
            this.pendingMouseEventEnd = event;
            setTimeout(this.handleClick, EventHandler.DOUBLECLICKMS);
            return;
          }
          this.pendingMouseEventEnd = null;
          // This is a swipe or highlight. Let the browser handle it.
          // (Swipes aren't handled on desktop.)
          this.pendingMouseEventStart = null;
        };
        this.handleTouchEventEnd = function (event) {
          event.preventDefault();
          if (BrowserUtilities.isZoomed()) {
            return;
          }
          if (event.changedTouches.length !== 1) {
            // This is a multi-touch event. Ignore.
            return;
          }
          if (!this.pendingTouchEventStart) {
            // Somehow we got an end event without a start event. Ignore it.
            return;
          }
          const startTouch = this.pendingTouchEventStart.changedTouches[0];
          const endTouch = event.changedTouches[0];
          if (!startTouch) {
            // Somehow we saved a touch event with no touches.
            return;
          }
          const devicePixelRatio = window.devicePixelRatio;
          const xDevicePixels =
            (startTouch.clientX - endTouch.clientX) / devicePixelRatio;
          const yDevicePixels =
            (startTouch.clientY - endTouch.clientY) / devicePixelRatio;
          // Is the end event in the same place as the start event?
          if (
            Math.abs(xDevicePixels) < EventHandler.TAPPIXELTOLERANCE &&
            Math.abs(yDevicePixels) < EventHandler.TAPPIXELTOLERANCE
          ) {
            if (this.pendingTouchEventEnd) {
              // This was a double tap. Let the browser handle it.
              this.pendingTouchEventStart = null;
              this.pendingTouchEventEnd = null;
              return;
            }
            // This was a single tap or long press.
            if (
              event.timeStamp - this.pendingTouchEventStart.timeStamp >
              EventHandler.LONGPRESSMS
            ) {
              // This was a long press. Let the browser handle it.
              this.pendingTouchEventStart = null;
              this.pendingTouchEventEnd = null;
              return;
            }
            // This was a single tap.
            this.pendingTouchEventStart = null;
            this.pendingTouchEventEnd = event;
            setTimeout(this.handleTap, EventHandler.DOUBLETAPMS);
            return;
          }
          this.pendingTouchEventEnd = null;
          if (
            event.timeStamp - this.pendingTouchEventStart.timeStamp >
            EventHandler.SLOWSWIPEMS
          ) {
            // This is a slow swipe / highlight. Let the browser handle it.
            this.pendingTouchEventStart = null;
            return;
          }
          // This is a swipe.
          const slope =
            (startTouch.clientY - endTouch.clientY) /
            (startTouch.clientX - endTouch.clientX);
          if (Math.abs(slope) > 0.5) {
            // This is a mostly vertical swipe. Ignore.
            this.pendingTouchEventStart = null;
            return;
          }
          // This was a horizontal swipe.
          if (xDevicePixels < 0) {
            this.onBackwardSwipe(event);
          } else {
            this.onForwardSwipe(event);
          }
          this.pendingTouchEventStart = null;
        };
        this.handleClick = function () {
          if (!this.pendingMouseEventEnd) {
            // Another click happened already.
            return;
          }
          if (this.checkForLink(this.pendingMouseEventEnd)) {
            // This was a single click on a link. Do nothing.
            this.pendingMouseEventEnd = null;
            return;
          }
          // This was a single click.
          const x = this.pendingMouseEventEnd.clientX;
          const width = window.innerWidth;
          if (x / width < 0.3) {
            this.onLeftTap(this.pendingMouseEventEnd);
          } else if (x / width > 0.7) {
            this.onRightTap(this.pendingMouseEventEnd);
          } else {
            this.onMiddleTap(this.pendingMouseEventEnd);
          }
          this.pendingMouseEventEnd = null;
          return;
        };
        this.handleTap = function () {
          if (!this.pendingTouchEventEnd) {
            // Another tap happened already.
            return;
          }
          if (this.checkForLink(this.pendingTouchEventEnd)) {
            this.handleLinks(this.pendingTouchEventEnd);
            // This was a single tap on a link. Do nothing.
            this.pendingTouchEventEnd = null;
            return;
          }
          // This was a single tap.
          const touch = this.pendingTouchEventEnd.changedTouches[0];
          if (!touch) {
            // Somehow we got a touch event with no touches.
            return;
          }
          const x = touch.clientX;
          const width = window.innerWidth;
          if (x / width < 0.3) {
            this.onLeftTap(this.pendingTouchEventEnd);
          } else if (x / width > 0.7) {
            this.onRightTap(this.pendingTouchEventEnd);
          } else {
            this.onMiddleTap(this.pendingTouchEventEnd);
          }
          this.pendingTouchEventEnd = null;
          return;
        };
        this.checkForLink = function (event) {
          const nextElement = event.target;
          while (nextElement && nextElement.tagName.toLowerCase() !== "body") {
            if (nextElement.tagName.toLowerCase() === "a" && nextElement.href) {
              return nextElement;
            } else {
              nextElement = nextElement.parentElement;
            }
          }
          return null;
        };
        // private handleMouseMove = (event: MouseEvent): void => {
        //     const x = event.clientX;
        //     const width = window.innerWidth;
        //     if (x / width < 0.3) {
        //         this.onLeftHover();
        //     } else if (x / width > 0.7) {
        //         this.onRightHover();
        //     } else {
        //         this.onRemoveHover();
        //     }
        // }
        this.handleMouseLeave = function () {
          this.onRemoveHover();
        };
        this.handleLinks = function (event) {
          const link = this.checkForLink(event);
          if (link) {
            // Open external links in new tabs.
            const isSameOrigin =
              window.location.protocol === link.protocol &&
              window.location.port === link.port &&
              window.location.hostname === link.hostname;
            const isInternal = link.href.indexOf("#");
            if (!isSameOrigin) {
              window.open(link.href, "blank");
              event.preventDefault();
              event.stopPropagation();
            } else if (isSameOrigin && isInternal !== -1) {
              this.onInternalLink(event);
            } else if (isSameOrigin && isInternal === -1) {
              link.click();
            }
          }
        };
        this.handleKeyboard = function (event) {
          const LEFTARROW = 37;
          const RIGHTARROW = 39;
          const TABKEY = 9;
          if (event.keyCode === LEFTARROW) {
            this.onLeftArrow(event);
          } else if (event.keyCode === RIGHTARROW) {
            this.onRightArrow(event);
          } else if (event.keyCode === TABKEY) {
            event.preventDefault();
          }
        };
      }
      EventHandler.prototype.setupEvents = function (element) {
        if (element !== null) {
          element.addEventListener(
            "touchstart",
            this.handleTouchEventStart.bind(this)
          );
          element.addEventListener(
            "touchend",
            this.handleTouchEventEnd.bind(this)
          );
          element.addEventListener(
            "mousedown",
            this.handleMouseEventStart.bind(this)
          );
          element.addEventListener(
            "mouseup",
            this.handleMouseEventEnd.bind(this)
          );
          // element.addEventListener("mouseenter", this.handleMouseMove.bind(this));
          // element.addEventListener("mousemove", this.handleMouseMove.bind(this));
          element.addEventListener(
            "mouseleave",
            this.handleMouseLeave.bind(this)
          );
          // Most click handling is done in the touchend and mouseup event handlers,
          // but if there's a click on an external link we need to cancel the click
          // event to prevent it from opening in the iframe.
          element.addEventListener("click", this.handleLinks.bind(this));
          element.addEventListener("keydown", this.handleKeyboard.bind(this));
        } else {
          throw "cannot setup events for null";
        }
      };
      EventHandler.CLICKPIXELTOLERANCE = 10;
      EventHandler.TAPPIXELTOLERANCE = 10;
      EventHandler.DOUBLECLICKMS = 200;
      EventHandler.LONGPRESSMS = 500;
      EventHandler.DOUBLETAPMS = 200;
      EventHandler.SLOWSWIPEMS = 500;
      return EventHandler;
    })();
    exports.default = EventHandler;
    return exports;
  })(EventHandler, BrowserUtilities);
  Navigator = (function (exports) {
    Object.defineProperty(exports, "esModule", { value: true });
    return exports;
  })(Navigator);
  PublisherFont = (function (exports, HTMLUtilities) {
    Object.defineProperty(exports, "esModule", { value: true });
    const PublisherFont = (function () {
      function PublisherFont() {
        this.name = "publisher-font";
        this.label = "Publisher";
      }
      PublisherFont.prototype.start = function () {
        const rootFrame = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "html"
        );
        HTMLUtilities.setAttr(rootFrame, "data-viewer-font", "publisher");
      };
      PublisherFont.prototype.stop = function () {
        const rootFrame = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "html"
        );
        HTMLUtilities.removeAttr(rootFrame, "data-viewer-font");
      };
      return PublisherFont;
    })();
    exports.default = PublisherFont;
    return exports;
  })(PublisherFont, HTMLUtilities);
  SerifFont = (function (exports, HTMLUtilities) {
    Object.defineProperty(exports, "esModule", { value: true });
    const SerifFont = (function () {
      function SerifFont() {
        this.name = "serif-font";
        this.label = "Serif";
      }
      SerifFont.prototype.start = function () {
        const rootFrame = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "html"
        );
        HTMLUtilities.setAttr(rootFrame, "data-viewer-font", "serif");
        HTMLUtilities.createStylesheet(
          rootFrame,
          "serif-font-internal",
          "* {font-family: 'Iowan Old Style', 'Sitka Text', Palatino, 'Book Antiqua', serif !important;}"
        );
      };
      SerifFont.prototype.stop = function () {
        const rootFrame = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "html"
        );
        HTMLUtilities.removeAttr(rootFrame, "data-viewer-font");
        HTMLUtilities.removeStylesheet(rootFrame, "serif-font-internal");
      };
      return SerifFont;
    })();
    exports.default = SerifFont;
    return exports;
  })(SerifFont, HTMLUtilities);
  SansFont = (function (exports, HTMLUtilities) {
    Object.defineProperty(exports, "esModule", { value: true });
    const SansFont = (function () {
      function SansFont() {
        this.name = "sans-font";
        this.label = "Sans-serif";
      }
      SansFont.prototype.start = function () {
        const rootFrame = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "html"
        );
        HTMLUtilities.setAttr(rootFrame, "data-viewer-font", "sans");
        HTMLUtilities.createStylesheet(
          rootFrame,
          "sans-font-internal",
          "* {font-family: Seravek, Calibri, Roboto, Arial, sans-serif !important;}"
        );
      };
      SansFont.prototype.stop = function () {
        const rootFrame = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "html"
        );
        HTMLUtilities.removeAttr(rootFrame, "data-viewer-font");
        HTMLUtilities.removeStylesheet(rootFrame, "sans-font-internal");
      };
      return SansFont;
    })();
    exports.default = SansFont;
    return exports;
  })(SansFont, HTMLUtilities);
  SepiaTheme = (function (exports, HTMLUtilities) {
    Object.defineProperty(exports, "esModule", { value: true });
    const SepiaTheme = (function () {
      function SepiaTheme() {
        this.name = "sepia-theme";
        this.label = "Sepia";
      }
      SepiaTheme.prototype.start = function () {
        const rootElement = document.documentElement;
        const rootFrame = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "html"
        );
        HTMLUtilities.setAttr(rootElement, "data-viewer-theme", "sepia");
        HTMLUtilities.createStylesheet(
          rootFrame,
          "sepia-mode-internal",
          ":root {background-color: #f6ecd9 !important}  img, svg {background-color: transparent !important; mix-blend-mode: multiply;}"
        );
      };
      SepiaTheme.prototype.stop = function () {
        const rootElement = document.documentElement;
        const rootFrame = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "html"
        );
        HTMLUtilities.removeAttr(rootElement, "data-viewer-theme");
        HTMLUtilities.removeStylesheet(rootFrame, "sepia-mode-internal");
      };
      return SepiaTheme;
    })();
    exports.default = SepiaTheme;
    return exports;
  })(SepiaTheme, HTMLUtilities);
  NightTheme = (function (exports, HTMLUtilities) {
    Object.defineProperty(exports, "esModule", { value: true });
    const NightTheme = (function () {
      function NightTheme() {
        this.name = "night-theme";
        this.label = "Night";
      }
      NightTheme.prototype.start = function () {
        const rootElement = document.documentElement;
        const rootFrame = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "html"
        );
        HTMLUtilities.setAttr(rootElement, "data-viewer-theme", "night");
        HTMLUtilities.createStylesheet(
          rootFrame,
          "night-mode-internal",
          ":root {background-color: #111 !important; color: #FFFFFF !important} :not(a) {background-color: transparent !important; color: #FFFFFF !important; border-color: currentColor !important;} a {color: #53CEEA !important;}"
        );
      };
      NightTheme.prototype.stop = function () {
        const rootElement = document.documentElement;
        const rootFrame = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "html"
        );
        HTMLUtilities.removeAttr(rootElement, "data-viewer-theme");
        HTMLUtilities.removeStylesheet(rootFrame, "night-mode-internal");
      };
      return NightTheme;
    })();
    exports.default = NightTheme;
    return exports;
  })(NightTheme, HTMLUtilities);
  ScrollingBookView = (function (exports, BrowserUtilities, HTMLUtilities) {
    Object.defineProperty(exports, "esModule", { value: true });
    const ScrollingBookView = (function () {
      function ScrollingBookView() {
        this.name = "scrolling-book-view";
        this.label = "Scrolling";
        this.sideMargin = 0;
        this.height = 0;
      }
      // Get available width for iframe container to sit within
      ScrollingBookView.prototype.getAvailableWidth = function () {
        const prevBtn = document.getElementById("prev-page-btn");
        const prevBtnWidth = 0;
        if (prevBtn) {
          prevBtn.classList.add("hidden");
          const rect = prevBtn.getBoundingClientRect();
          prevBtnWidth = rect.width;
        }
        const nextBtn = document.getElementById("next-page-btn");
        const nextBtnWidth = 0;
        if (nextBtn) {
          const rect = nextBtn.getBoundingClientRect();
          nextBtnWidth = rect.width;
        }
        return window.innerWidth - prevBtnWidth - nextBtnWidth;
      };
      ScrollingBookView.prototype.getAvailableHeight = function () {
        const topBar = document.getElementById("top-control-bar");
        const topHeight = 0;
        if (topBar) {
          const topRect = topBar.getBoundingClientRect();
          topHeight = topRect.height;
        }
        const bottomBar = document.getElementById("bottom-control-bar");
        const bottomHeight = 0;
        if (bottomBar) {
          const bottomRect = bottomBar.getBoundingClientRect();
          bottomHeight = bottomRect.height;
        }
        return window.innerHeight - topHeight - bottomHeight;
      };
      ScrollingBookView.prototype.setIFrameSize = function () {
        const width = this.getAvailableWidth() + "px";
        this.bookElement.style.height = this.getAvailableHeight() + "px";
        this.bookElement.style.width = width;
        const body = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "body"
        );
        this.bookElement.style.height = this.getAvailableHeight() + "px";
        const images = Array.prototype.slice.call(body.querySelectorAll("img"));
        for (const i = 0, images3 = images; i < images3.length; i++) {
          const image = images3[i];
          image.style.maxWidth = width;
        }
      };
      ScrollingBookView.prototype.start = function (position) {
        this.goToPosition(position);
      };
      ScrollingBookView.prototype.stop = function () {
        this.bookElement.style.height = "";
        this.bookElement.style.width = "";
        const body = HTMLUtilities.findRequiredIframeElement(
          this.bookElement.contentDocument,
          "body"
        );
        body.style.width = "";
        body.style.marginLeft = "";
        body.style.marginRight = "";
        const images = Array.prototype.slice.call(body.querySelectorAll("img"));
        for (const i = 0, images4 = images; i < images4.length; i++) {
          const image = images4[i];
          image.style.maxWidth = "";
        }
      };
      ScrollingBookView.prototype.getCurrentPosition = function () {
        return document.body.scrollTop / document.body.scrollHeight;
      };
      ScrollingBookView.prototype.atBottom = function () {
        return (
          document.body.scrollHeight - document.body.scrollTop ===
          BrowserUtilities.getHeight()
        );
      };
      ScrollingBookView.prototype.goToPosition = function (position) {
        this.setIFrameSize();
        document.body.scrollTop = document.body.scrollHeight * position;
      };
      ScrollingBookView.prototype.goToElement = function (elementId) {
        const element = this.bookElement.contentDocument.getElementById(
          elementId
        );
        if (element) {
          // Put the element as close to the top as possible.
          element.scrollIntoView();
          // Unless we're already at the bottom, scroll up so the element is
          // in the middle, and not covered by the top nav.
          if (document.body.scrollHeight - element.offsetTop >= this.height) {
            document.body.scrollTop = Math.max(
              0,
              document.body.scrollTop - this.height / 3
            );
          }
        }
      };
      return ScrollingBookView;
    })();
    exports.default = ScrollingBookView;
    return exports;
  })(ScrollingBookView, BrowserUtilities, HTMLUtilities);
  Manifest = (function (exports) {
    Object.defineProperty(exports, "esModule", { value: true });
    const Manifest = (function () {
      function Manifest(manifestJSON, manifestUrl) {
        this.metadata = manifestJSON.metadata || {};
        this.links = manifestJSON.links || [];
        this.spine = manifestJSON.readingOrder || manifestJSON.spine || [];
        this.resources = manifestJSON.resources || [];
        this.toc = manifestJSON.toc || [];
        this.manifestUrl = manifestUrl;
      }
      Manifest.getManifest = function (manifestUrl, store) {
        return awaiter(this, void 0, void 0, function () {
          const fetchManifest,
            tryToUpdateManifestButIgnoreResult,
            manifestString,
            manifestJSON;
          const this = this;
          return generator(this, function (a) {
            switch (a.label) {
              case 0:
                fetchManifest = function () {
                  return awaiter(this, void 0, void 0, function () {
                    const response, manifestJSON;
                    return generator(this, function (a) {
                      switch (a.label) {
                        case 0:
                          return [4, window.fetch(manifestUrl.href)];
                        case 1:
                          response = a.sent();
                          return [4, response.json()];
                        case 2:
                          manifestJSON = a.sent();
                          if (!store) return [3, 4];
                          return [
                            4,
                            store.set("manifest", JSON.stringify(manifestJSON))
                          ];
                        case 3:
                          a.sent();
                          a.label = 4;
                        case 4:
                          return [2, new Manifest(manifestJSON, manifestUrl)];
                      }
                    });
                  });
                };
                tryToUpdateManifestButIgnoreResult = function () {
                  return awaiter(this, void 0, void 0, function () {
                    const err1;
                    return generator(this, function (a) {
                      switch (a.label) {
                        case 0:
                          a.trys.push([0, 2, , 3]);
                          return [4, fetchManifest()];
                        case 1:
                          a.sent();
                          return [3, 3];
                        case 2:
                          err1 = a.sent();
                          return [3, 3];
                        case 3:
                          return [
                            2,
                            new Promise(function (resolve) {
                              return resolve();
                            })
                          ];
                      }
                    });
                  });
                };
                if (!store) return [3, 2];
                return [4, store.get("manifest")];
              case 1:
                manifestString = a.sent();
                if (manifestString) {
                  // Kick off a fetch to update the store for next time,
                  // but don't await it.
                  tryToUpdateManifestButIgnoreResult();
                  manifestJSON = JSON.parse(manifestString);
                  return [2, new Manifest(manifestJSON, manifestUrl)];
                }
                a.label = 2;
              case 2:
                return [2, fetchManifest()];
            }
          });
        });
      };
      Manifest.prototype.getStartLink = function () {
        if (this.spine.length > 0) {
          return this.spine[0];
        }
        return null;
      };
      Manifest.prototype.getPreviousSpineItem = function (href) {
        const index = this.getSpineIndex(href);
        if (index !== null && index > 0) {
          return this.spine[index - 1];
        }
        return null;
      };
      Manifest.prototype.getNextSpineItem = function (href) {
        const index = this.getSpineIndex(href);
        if (index !== null && index < this.spine.length - 1) {
          return this.spine[index + 1];
        }
        return null;
      };
      Manifest.prototype.getSpineItem = function (href) {
        const index = this.getSpineIndex(href);
        if (index !== null) {
          return this.spine[index];
        }
        return null;
      };
      Manifest.prototype.getSpineIndex = function (href) {
        for (const index = 0; index < this.spine.length; index++) {
          const item = this.spine[index];
          if (item.href) {
            const itemUrl = new URL(item.href, this.manifestUrl.href).href;
            if (itemUrl === href) {
              return index;
            }
          }
        }
        return null;
      };
      Manifest.prototype.getTOCItem = function (href) {
        const this = this;
        const findItem = function (href, links) {
          for (const index = 0; index < links.length; index++) {
            const item = links[index];
            if (item.href) {
              const itemUrl = new URL(item.href, this.manifestUrl.href).href;
              if (itemUrl === href) {
                return item;
              }
            }
            if (item.children) {
              const childItem = findItem(href, item.children);
              if (childItem !== null) {
                return childItem;
              }
            }
          }
          return null;
        };
        return findItem(href, this.toc);
      };
      return Manifest;
    })();
    exports.default = Manifest;
    return exports;
  })(Manifest);
  IFrameNavigator = (function (
    exports,
    Cacher1,
    Manifest1,
    EventHandler1,
    HTMLUtilities,
    IconLib
  ) {
    Object.defineProperty(exports, "esModule", { value: true });
    const epubReadingSystemObject = {
      name: "Webpub viewer",
      version: "0.1.0"
    };
    const epubReadingSystem = Object.freeze(epubReadingSystemObject);
    const upLinkTemplate = function (label, ariaLabel) {
      return (
        '\n  <a rel="up" aria-label="' +
        ariaLabel +
        '" tabindex="0">\n    <svg xmlns="http://www.w3.org/2000/svg" width="' +
        IconLib.WIDTHATTR +
        '" height="' +
        IconLib.HEIGHTATTR +
        '" viewBox="' +
        IconLib.VIEWBOXATTR +
        '" aria-labelledby="up-label" preserveAspectRatio="xMidYMid meet" role="img" class="icon">\n      <title id="up-label">' +
        label +
        "</title>\n      " +
        IconLib.icons.home +
        '\n    </svg>\n    <span class="setting-text up">' +
        label +
        "</span>\n  </a>\n"
      );
    };
    const template =
      '\n  <nav class="publication">\n    <div class="controls">\n        ' +
      IconLib.icons.closeOriginal +
      "\n        " +
      IconLib.icons.checkOriginal +
      '\n      <a href="#settings-control" class="scrolling-suggestion" style="display: none">\n          We recommend scrolling mode for use with screen readers and keyboard navigation.\n          Go to settings to switch to scrolling mode.\n      </a>\n      <ul  id="top-control-bar" class="links top active">\n        <li>\n          <button class="contents disabled" aria-labelledby="contents-label" aria-haspopup="true" aria-expanded="false">\n            ' +
      IconLib.icons.toc +
      "\n            " +
      IconLib.icons.closeDupe +
      '\n            <label class="setting-text contents" id="contents-label">Table Of Contents</label>\n          </button>\n          <div class="contents-view controls-view inactive" aria-hidden="true"></div>\n        </li>\n        <li>\n          <button id="settings-control" class="settings" aria-labelledby="settings-label" aria-expanded="false" aria-haspopup="true">\n            ' +
      IconLib.icons.settings +
      "\n            " +
      IconLib.icons.closeDupe +
      '\n            <label class="setting-text settings" id="settings-label">Settings</label>\n          </button>\n          <div class="settings-view controls-view inactive" aria-hidden="true"></div>\n        </li>\n      </ul>\n    </div>\n    <!-- /controls -->\n  </nav>\n  <main style="overflow: hidden">\n    <div class="loading" style="display:none;">\n      ' +
      IconLib.icons.loading +
      '\n    </div>\n    <div class="error" style="display:none;">\n      <span>\n        ' +
      IconLib.icons.error +
      '\n      </span>\n      <span>There was an error loading this page.</span>\n      <button class="go-back">Go back</button>\n      <button class="try-again">Try again</button>\n    </div>\n    <div class="info top">\n      <span class="book-title"></span>\n    </div>\n    <div class="page-container">\n        <div id="prev-page-btn" class="flip-page-container">\n            <button class="flip-page-btn prev">\n                <svg viewBox="0 0 24 24" role="img" width="24" height="24"\n                aria-labelledby="next-page-btn-title" class="flip-page-icon prev">\n                    <title id="next-page-btn-title">Switch to next page</title>\n                    <path d="M16.59 8.59 L12 13.17 7.41 8.59 6 10 l6 6 6-6-1.41-1.41z"/>\n                </svg>\n            </button>\n        </div>\n        <div id="iframe-container" tabindex=0>\n            <iframe tabindex=-1 allowtransparency="true" title="book text" style="border:0; overflow: hidden;"></iframe>\n        </div>\n        <div id="next-page-btn" class="flip-page-container">\n            <button class="flip-page-btn next">\n                <svg viewBox="0 0 24 24" role="img" width="24" height="24"\n                    aria-labelledby="next-page-btn-title" class="flip-page-icon next">\n                    <title id="next-page-btn-title">Switch to next page</title>\n                    <path d="M16.59 8.59 L12 13.17 7.41 8.59 6 10 l6 6 6-6-1.41-1.41z"/>\n                </svg>\n            </button>\n        </div>\n    </div>\n    <div class="info bottom">\n      <span class="chapter-position"></span>\n      <span class="chapter-title"></span>\n    </div>\n  </main>\n  <nav class="publication">\n    <div class="controls">\n      <ul id="bottom-control-bar" class="links bottom active">\n        <li>\n          <a rel="prev" class="disabled" role="button" aria-labelledby="previous-label">\n          ' +
      IconLib.icons.previous +
      '\n          <span class="chapter-control" id="previous-label">Previous Chapter</span>\n          </a>\n        </li>\n        <li aria-label="chapters">Chapters</li>\n        <li>\n          <a rel="next" class="disabled" role="button" aria-labelledby="next-label">\n            <span class="chapter-control" id ="next-label">Next Chapter</span>\n            ' +
      IconLib.icons.next +
      "\n          </a>\n        </li>\n      </ul>\n    </div>\n    <!-- /controls -->\n  </nav>\n";
    /** Class that shows webpub resources in an iframe, with navigation controls outside the iframe. */
    const IFrameNavigator = (function () {
      function IFrameNavigator(
        store,
        cacher,
        settings,
        annotator,
        publisher,
        serif,
        sans,
        day,
        sepia,
        night,
        paginator,
        scroller,
        eventHandler,
        upLinkConfig,
        allowFullscreen
      ) {
        if (cacher === void 0) {
          cacher = null;
        }
        if (annotator === void 0) {
          annotator = null;
        }
        if (publisher === void 0) {
          publisher = null;
        }
        if (serif === void 0) {
          serif = null;
        }
        if (sans === void 0) {
          sans = null;
        }
        if (day === void 0) {
          day = null;
        }
        if (sepia === void 0) {
          sepia = null;
        }
        if (night === void 0) {
          night = null;
        }
        if (paginator === void 0) {
          paginator = null;
        }
        if (scroller === void 0) {
          scroller = null;
        }
        if (eventHandler === void 0) {
          eventHandler = null;
        }
        if (upLinkConfig === void 0) {
          upLinkConfig = null;
        }
        if (allowFullscreen === void 0) {
          allowFullscreen = null;
        }
        this.upLink = null;
        this.fullscreen = null;
        this.canFullscreen =
          document.fullscreenEnabled ||
          document.webkitFullscreenEnabled ||
          document.mozFullScreenEnabled ||
          document.msFullscreenEnabled;
        this.store = store;
        this.cacher = cacher;
        this.settings = settings;
        this.annotator = annotator;
        this.publisher = publisher;
        this.serif = serif;
        this.sans = sans;
        this.day = day;
        this.sepia = sepia;
        this.night = night;
        this.paginator = paginator;
        this.scroller = scroller;
        this.eventHandler = eventHandler || new EventHandler1.default();
        this.upLinkConfig = upLinkConfig;
        this.allowFullscreen = allowFullscreen;
      }
      IFrameNavigator.create = function (config) {
        return awaiter(this, void 0, void 0, function () {
          const navigator;
          return generator(this, function (a) {
            switch (a.label) {
              case 0:
                navigator = new this(
                  config.store,
                  config.cacher || null,
                  config.settings,
                  config.annotator || null,
                  config.publisher || null,
                  config.serif || null,
                  config.sans || null,
                  config.day || null,
                  config.sepia || null,
                  config.night || null,
                  config.paginator || null,
                  config.scroller || null,
                  config.eventHandler || null,
                  config.upLink || null,
                  config.allowFullscreen || null
                );
                return [4, navigator.start(config.element, config.manifestUrl)];
              case 1:
                a.sent();
                return [2, navigator];
            }
          });
        });
      };
      IFrameNavigator.prototype.start = function (element, manifestUrl) {
        return awaiter(this, void 0, void 0, function () {
          const settingsButtons, lastSettingsButton, err2;
          return generator(this, function (a) {
            switch (a.label) {
              case 0:
                element.innerHTML = template;
                this.manifestUrl = manifestUrl;
                a.label = 1;
              case 1:
                a.trys.push([1, 3, , 4]);
                this.pageContainer = HTMLUtilities.findRequiredElement(
                  element,
                  ".page-container"
                );
                this.iframe = HTMLUtilities.findRequiredElement(
                  element,
                  "iframe"
                );
                this.scrollingSuggestion = HTMLUtilities.findRequiredElement(
                  element,
                  ".scrolling-suggestion"
                );
                this.nextChapterLink = HTMLUtilities.findRequiredElement(
                  element,
                  "a[rel=next]"
                );
                this.previousChapterLink = HTMLUtilities.findRequiredElement(
                  element,
                  "a[rel=prev]"
                );
                this.contentsControl = HTMLUtilities.findRequiredElement(
                  element,
                  "button.contents"
                );
                this.settingsControl = HTMLUtilities.findRequiredElement(
                  element,
                  "button.settings"
                );
                this.links = HTMLUtilities.findRequiredElement(
                  element,
                  "ul.links.top"
                );
                this.linksBottom = HTMLUtilities.findRequiredElement(
                  element,
                  "ul.links.bottom"
                );
                this.tocView = HTMLUtilities.findRequiredElement(
                  element,
                  ".contents-view"
                );
                this.settingsView = HTMLUtilities.findRequiredElement(
                  element,
                  ".settings-view"
                );
                this.loadingMessage = HTMLUtilities.findRequiredElement(
                  element,
                  "div[class=loading]"
                );
                this.errorMessage = HTMLUtilities.findRequiredElement(
                  element,
                  "div[class=error]"
                );
                this.tryAgainButton = HTMLUtilities.findRequiredElement(
                  element,
                  "button[class=try-again]"
                );
                this.goBackButton = HTMLUtilities.findRequiredElement(
                  element,
                  "button[class=go-back]"
                );
                this.infoTop = HTMLUtilities.findRequiredElement(
                  element,
                  "div[class='info top']"
                );
                this.infoBottom = HTMLUtilities.findRequiredElement(
                  element,
                  "div[class='info bottom']"
                );
                this.bookTitle = HTMLUtilities.findRequiredElement(
                  this.infoTop,
                  "span[class=book-title]"
                );
                this.chapterTitle = HTMLUtilities.findRequiredElement(
                  this.infoBottom,
                  "span[class=chapter-title]"
                );
                this.chapterPosition = HTMLUtilities.findRequiredElement(
                  this.infoBottom,
                  "span[class=chapter-position]"
                );
                // this.menuControl = HTMLUtilities.findRequiredElement(element, "button.trigger") as HTMLButtonElement;
                this.newPosition = null;
                this.newElementId = null;
                this.isBeingStyled = true;
                this.isLoading = true;
                this.setupEvents();
                if (this.publisher) {
                  this.publisher.bookElement = this.iframe;
                }
                if (this.serif) {
                  this.serif.bookElement = this.iframe;
                }
                if (this.sans) {
                  this.sans.bookElement = this.iframe;
                }
                if (this.day) {
                  this.day.bookElement = this.iframe;
                }
                if (this.sepia) {
                  this.sepia.bookElement = this.iframe;
                }
                if (this.night) {
                  this.night.bookElement = this.iframe;
                }
                if (this.paginator) {
                  this.paginator.bookElement = this.iframe;
                }
                if (this.scroller) {
                  this.scroller.bookElement = this.iframe;
                }
                this.settings.renderControls(this.settingsView);
                this.settings.onFontChange(this.updateFont.bind(this));
                this.settings.onFontSizeChange(this.updateFontSize.bind(this));
                this.settings.onViewChange(this.updateBookView.bind(this));
                settingsButtons = this.settingsView.querySelectorAll("button");
                if (settingsButtons && settingsButtons.length > 0) {
                  lastSettingsButton =
                    settingsButtons[settingsButtons.length - 1];
                  this.setupModalFocusTrap(
                    this.settingsView,
                    this.settingsControl,
                    lastSettingsButton
                  );
                }
                if (this.cacher) {
                  this.cacher.onStatusUpdate(
                    this.updateOfflineCacheStatus.bind(this)
                  );
                  this.enableOffline();
                }
                if (
                  this.scroller &&
                  this.settings.getSelectedView() !== this.scroller
                ) {
                  this.scrollingSuggestion.style.display = "block";
                }
                return [4, this.loadManifest()];
              case 2:
                return [2, a.sent()];
              case 3:
                err2 = a.sent();
                // There's a mismatch between the template and the selectors above,
                // or we weren't able to insert the template in the element.
                return [
                  2,
                  new Promise(function (, reject) {
                    return reject(err2);
                  }).catch(function () {})
                ];
              case 4:
                return [2];
            }
          });
        });
      };
      IFrameNavigator.prototype.setupEvents = function () {
        const this = this;
        this.iframe.addEventListener("load", this.handleIFrameLoad.bind(this));
        const delay = 200;
        const timeout;
        window.addEventListener("resize", function () {
          clearTimeout(timeout);
          timeout = setTimeout(this.handleResize.bind(this), delay);
        });
        this.previousChapterLink.addEventListener(
          "click",
          this.handlePreviousChapterClick.bind(this)
        );
        this.nextChapterLink.addEventListener(
          "click",
          this.handleNextChapterClick.bind(this)
        );
        this.contentsControl.addEventListener(
          "click",
          this.handleContentsClick.bind(this)
        );
        this.settingsControl.addEventListener(
          "click",
          this.handleSettingsClick.bind(this)
        );
        this.settingsView.addEventListener(
          "click",
          this.handleToggleLinksClick.bind(this)
        );
        this.tryAgainButton.addEventListener("click", this.tryAgain.bind(this));
        this.goBackButton.addEventListener("click", this.goBack.bind(this));
        // this.menuControl.addEventListener("click", this.handleToggleLinksClick.bind(this));
        this.contentsControl.addEventListener(
          "keydown",
          this.hideTOCOnEscape.bind(this)
        );
        this.tocView.addEventListener(
          "keydown",
          this.hideTOCOnEscape.bind(this)
        );
        this.settingsControl.addEventListener(
          "keydown",
          this.hideSettingsOnEscape.bind(this)
        );
        this.settingsView.addEventListener(
          "keydown",
          this.hideSettingsOnEscape.bind(this)
        );
        window.addEventListener(
          "keydown",
          this.handleKeyboardNavigation.bind(this)
        );
        const iframeContainer = document.getElementById("iframe-container");
        if (iframeContainer) {
          iframeContainer.addEventListener(
            "focus",
            this.handleIframeFocus.bind(this)
          );
        }
        const nextPageBtn = document.getElementById("next-page-btn");
        if (nextPageBtn) {
          nextPageBtn.addEventListener(
            "click",
            this.handleNextPageClick.bind(this)
          );
        }
        const prevPageBtn = document.getElementById("prev-page-btn");
        if (prevPageBtn) {
          prevPageBtn.addEventListener(
            "click",
            this.handlePreviousPageClick.bind(this)
          );
        }
        if (this.allowFullscreen && this.canFullscreen) {
          document.addEventListener(
            "fullscreenchange",
            this.toggleFullscreenIcon.bind(this)
          );
          document.addEventListener(
            "webkitfullscreenchange",
            this.toggleFullscreenIcon.bind(this)
          );
          document.addEventListener(
            "mozfullscreenchange",
            this.toggleFullscreenIcon.bind(this)
          );
          document.addEventListener(
            "MSFullscreenChange",
            this.toggleFullscreenIcon.bind(this)
          );
        }
      };
      IFrameNavigator.prototype.setupModalFocusTrap = function (
        modal,
        closeButton,
        lastFocusableElement
      ) {
        const this = this;
        // Trap keyboard focus in a modal dialog when it's displayed.
        const TABKEY = 9;
        // Going backwards from the close button sends you to the last focusable element.
        closeButton.addEventListener("keydown", function (event) {
          if (this.isDisplayed(modal)) {
            const tab = event.keyCode === TABKEY;
            const shift = !!event.shiftKey;
            if (tab && shift) {
              lastFocusableElement.focus();
              event.preventDefault();
              event.stopPropagation();
            }
          }
        });
        // Going forward from the last focusable element sends you to the close button.
        lastFocusableElement.addEventListener("keydown", function (event) {
          if (this.isDisplayed(modal)) {
            const tab = event.keyCode === TABKEY;
            const shift = !!event.shiftKey;
            if (tab && !shift) {
              closeButton.focus();
              event.preventDefault();
              event.stopPropagation();
            }
          }
        });
      };
      IFrameNavigator.prototype.handleKeyboardNavigation = function (event) {
        const LEFTARROW = 37;
        const RIGHTARROW = 39;
        if (this.settings.getSelectedView() === this.paginator) {
          if (event.keyCode === LEFTARROW) {
            this.handlePreviousPageClick(event);
          } else if (event.keyCode === RIGHTARROW) {
            this.handleNextPageClick(event);
          }
        }
      };
      IFrameNavigator.prototype.updateFont = function () {
        this.handleResize();
      };
      IFrameNavigator.prototype.updateFontSize = function () {
        this.handleResize();
      };
      IFrameNavigator.prototype.updateBookView = function () {
        const doNothing = function () {};
        if (this.settings.getSelectedView() === this.paginator) {
          const prevBtn = document.getElementById("prev-page-btn");
          if (prevBtn && prevBtn.classList.contains("hidden")) {
            prevBtn.classList.remove("hidden");
          }
          const nextBtn = document.getElementById("next-page-btn");
          if (nextBtn && nextBtn.classList.contains("hidden")) {
            nextBtn.classList.remove("hidden");
          }
          this.scrollingSuggestion.style.display = "block";
          document.body.onscroll = function () {};
          this.chapterTitle.style.display = "inline";
          this.chapterPosition.style.display = "inline";
          if (this.eventHandler) {
            this.eventHandler.onBackwardSwipe = this.handlePreviousPageClick.bind(
              this
            );
            this.eventHandler.onForwardSwipe = this.handleNextPageClick.bind(
              this
            );
            this.eventHandler.onLeftTap = this.handlePreviousPageClick.bind(
              this
            );
            this.eventHandler.onMiddleTap = this.handleToggleLinksClick.bind(
              this
            );
            this.eventHandler.onRightTap = this.handleNextPageClick.bind(this);
            this.eventHandler.onInternalLink = this.handleInternalLink.bind(
              this
            );
            this.eventHandler.onLeftArrow = this.handleKeyboardNavigation.bind(
              this
            );
            this.eventHandler.onRightArrow = this.handleKeyboardNavigation.bind(
              this
            );
          }
        } else if (this.settings.getSelectedView() === this.scroller) {
          this.scrollingSuggestion.style.display = "none";
          const prevBtn = document.getElementById("prev-page-btn");
          if (prevBtn && !prevBtn.classList.contains("hidden")) {
            prevBtn.classList.add("hidden");
          }
          const nextBtn = document.getElementById("next-page-btn");
          if (nextBtn && !nextBtn.classList.contains("hidden")) {
            nextBtn.classList.add("hidden");
          }
          this.chapterTitle.style.display = "none";
          this.chapterPosition.style.display = "none";
          if (this.eventHandler) {
            this.eventHandler.onBackwardSwipe = doNothing;
            this.eventHandler.onForwardSwipe = doNothing;
            this.eventHandler.onLeftTap = this.handleToggleLinksClick.bind(
              this
            );
            this.eventHandler.onMiddleTap = this.handleToggleLinksClick.bind(
              this
            );
            this.eventHandler.onRightTap = this.handleToggleLinksClick.bind(
              this
            );
            this.eventHandler.onLeftHover = doNothing;
            this.eventHandler.onRightHover = doNothing;
            this.eventHandler.onRemoveHover = doNothing;
            this.eventHandler.onInternalLink = doNothing;
            this.eventHandler.onLeftArrow = doNothing;
            this.eventHandler.onRightArrow = doNothing;
          }
        }
        this.updatePositionInfo();
        this.handleResize();
      };
      IFrameNavigator.prototype.enableOffline = function () {
        if (
          this.cacher &&
          this.cacher.getStatus() !== Cacher1.CacheStatus.Downloaded
        ) {
          this.cacher.enable();
        }
      };
      IFrameNavigator.prototype.updateOfflineCacheStatus = function (status) {
    const statusElement = this.settings.getOfflineStatusElement();
        let statusMessage = "";
        if (status === Cacher1.CacheStatus.Uncached) {
          statusMessage = "";
        } else if (status === Cacher1.CacheStatus.UpdateAvailable) {
          statusMessage = "A new version is available. Refresh to update.";
        } else if (status === Cacher1.CacheStatus.CheckingForUpdate) {
          statusMessage = "Checking for update.";
        } else if (status === Cacher1.CacheStatus.Downloading) {
          statusMessage = "Downloading...";
        } else if (status === Cacher1.CacheStatus.Downloaded) {
          statusMessage = "Downloaded for offline use";
        } else if (status === Cacher1.CacheStatus.Error) {
          statusMessage = "Error downloading for offline use";
        }
        statusElement.innerHTML = statusMessage;
      };
      IFrameNavigator.prototype.loadManifest = function () {
        return awaiter(this, void 0, void 0, function () {
         let manifest,
            toc,
            createTOC1,
            upLabel,
            upAriaLabel,
            upHTML,
            upParent,
            fullscreenHTML,
            fullscreenParent,
            lastReadingPosition,
            startLink,
            startUrl,
            position,
            err3;
          const this = this;
          return generator(this, function (a) {
            switch (a.label) {
              case 0:
                a.trys.push([0, 4, , 5]);
                return [
                  4,
                  Manifest1.default.getManifest(this.manifestUrl, this.store)
                ];
              case 1:
                manifest = a.sent();
                toc = manifest.toc;
                if (toc.length) {
                  this.contentsControl.className = "contents";
                  createTOC1 = function (parentElement, links) {
                    const listElement = document.createElement("ol");
                    const lastLink = null;
                    for (
                      const i = 0, links1 = links;
                      i < links1.length;
                      i++
                    ) {
                      const link = links1[i];
                      const listItemElement = document.createElement("li");
                      const linkElement = document.createElement("a");
                      const spanElement = document.createElement("span");
                      linkElement.tabIndex = -1;
                      const href = "";
                      if (link.href) {
                        href = new URL(link.href, this.manifestUrl.href).href;
                        linkElement.href = href;
                        linkElement.innerHTML = link.title || "";
                        listItemElement.appendChild(linkElement);
                      } else {
                        spanElement.innerHTML = link.title || "";
                        listItemElement.appendChild(spanElement);
                      }
                      if (link.children && link.children.length > 0) {
                        createTOC1(listItemElement, link.children);
                      }
                      listElement.appendChild(listItemElement);
                      lastLink = linkElement;
                    }
                    // Trap keyboard focus inside the TOC while it's open.
                    if (lastLink) {
                      this.setupModalFocusTrap(
                        this.tocView,
                        this.contentsControl,
                        lastLink
                      );
                    }
                    listElement.addEventListener("click", function (event) {
                      event.preventDefault();
                      event.stopPropagation();
                      if (
                        event.target &&
                        event.target.tagName.toLowerCase() === "a"
                      ) {
                        const linkElement = event.target;
                        if (linkElement.className.indexOf("active") !== -1) {
                          // This TOC item is already loaded. Hide the TOC
                          // but don't navigate.
                          this.hideTOC();
                        } else {
                          // Set focus back to the contents toggle button so screen readers
                          // don't get stuck on a hidden link.
                          this.contentsControl.focus();
                          this.navigate({
                            resource: linkElement.href,
                            position: 0
                          });
                        }
                      }
                    });
                    parentElement.appendChild(listElement);
                  };
                  createTOC1(this.tocView, toc);
                } else {
                  this.contentsControl.parentElement.style.display = "none";
                }
                if (this.upLinkConfig && this.upLinkConfig.url) {
                  upLabel = this.upLinkConfig.label || "";
                  upAriaLabel = this.upLinkConfig.ariaLabel || upLabel;
                  upHTML = upLinkTemplate(upLabel, upAriaLabel);
                  upParent = document.createElement("li");
                  upParent.classList.add("uplink-wrapper");
                  upParent.innerHTML = upHTML;
                  this.links.insertBefore(upParent, this.links.firstChild);
                  this.upLink = HTMLUtilities.findRequiredElement(
                    this.links,
                    "a[rel=up]"
                  );
                  this.upLink.addEventListener(
                    "click",
                    this.handleClick,
                    false
                  );
                }
                if (this.allowFullscreen && this.canFullscreen) {
                  fullscreenHTML =
                    '<button id="fullscreen-control" class="fullscreen" aria-labelledby="fullScreen-label" aria-hidden="false">' +
                    IconLib.icons.expand +
                    " " +
                    IconLib.icons.minimize +
                    '<label id="fullscreen-label" class="setting-text">Toggle Fullscreen</label></button>';
                  fullscreenParent = document.createElement("li");
                  fullscreenParent.innerHTML = fullscreenHTML;
                  this.links.appendChild(fullscreenParent);
                  this.fullscreen = HTMLUtilities.findRequiredElement(
                    this.links,
                    "#fullscreen-control"
                  );
                  this.fullscreen.addEventListener(
                    "click",
                    this.toggleFullscreen.bind(this)
                  );
                }
                lastReadingPosition = null;
                if (!this.annotator) return [3, 3];
                return [4, this.annotator.getLastReadingPosition()];
              case 2:
                lastReadingPosition = a.sent();
                a.label = 3;
              case 3:
                startLink = manifest.getStartLink();
                startUrl = null;
                if (startLink && startLink.href) {
                  startUrl = new URL(startLink.href, this.manifestUrl.href)
                    .href;
                }
                if (lastReadingPosition) {
                  this.navigate(lastReadingPosition);
                } else if (startUrl) {
                  position = {
                    resource: startUrl,
                    position: 0
                  };
                  this.navigate(position);
                }
                return [
                  2,
                  new Promise(function (resolve) {
                    return resolve();
                  })
                ];
              case 4:
                err3 = a.sent();
                this.abortOnError();
                return [
                  2,
                  new Promise(function (, reject) {
                    return reject(err3);
                  }).catch(function () {})
                ];
              case 5:
                return [2];
            }
          });
        });
      };
      IFrameNavigator.prototype.handleIFrameLoad = function () {
        return awaiter(this, void 0, void 0, function () {
          const bookViewPosition,
            currentLocation,
            elementId,
            manifest,
            previous,
            next,
            chapterTitle,
            spineItem,
            tocItem,
            err4;
          return generator(this, function (a) {
            switch (a.label) {
              case 0:
                this.errorMessage.style.display = "none";
                this.showLoadingMessageAfterDelay();
                a.label = 1;
              case 1:
                a.trys.push([1, 5, , 6]);
                this.hideTOC();
                bookViewPosition = 0;
                if (this.newPosition) {
                  bookViewPosition = this.newPosition.position;
                  this.newPosition = null;
                }
                this.updateFont();
                this.updateFontSize();
                this.updateBookView();
                this.settings.getSelectedFont().start();
                this.settings.getSelectedTheme().start();
                this.settings.getSelectedView().start(bookViewPosition);
                if (this.newElementId) {
                  this.settings
                    .getSelectedView()
                    .goToElement(this.newElementId);
                  this.newElementId = null;
                }
                currentLocation = this.iframe.src;
                if (
                  this.iframe.contentDocument &&
                  this.iframe.contentDocument.location &&
                  this.iframe.contentDocument.location.href
                ) {
                  currentLocation = this.iframe.contentDocument.location.href;
                }
                if (currentLocation.indexOf("#") !== -1) {
                  elementId = currentLocation.slice(
                    currentLocation.indexOf("#") + 1
                  );
                  // Set the element to go to the next time the iframe loads.
                  this.newElementId = elementId;
                  // Reload the iframe without the anchor.
                  this.iframe.src = currentLocation.slice(
                    0,
                    currentLocation.indexOf("#")
                  );
                  return [
                    2,
                    new Promise(function (resolve) {
                      return resolve();
                    })
                  ];
                }
                this.updatePositionInfo();
                return [
                  4,
                  Manifest1.default.getManifest(this.manifestUrl, this.store)
                ];
              case 2:
                manifest = a.sent();
                previous = manifest.getPreviousSpineItem(currentLocation);
                if (previous && previous.href) {
                  this.previousChapterLink.href = new URL(
                    previous.href,
                    this.manifestUrl.href
                  ).href;
                  this.previousChapterLink.className = "";
                } else {
                  this.previousChapterLink.removeAttribute("href");
                  this.previousChapterLink.className = "disabled"; // this.handleRemoveHover();
                }
                next = manifest.getNextSpineItem(currentLocation);
                if (next && next.href) {
                  this.nextChapterLink.href = new URL(
                    next.href,
                    this.manifestUrl.href
                  ).href;
                  this.nextChapterLink.className = "";
                } else {
                  this.nextChapterLink.removeAttribute("href");
                  this.nextChapterLink.className = "disabled"; // this.handleRemoveHover();
                }
                this.setActiveTOCItem(currentLocation);
                if (manifest.metadata.title) {
                  this.bookTitle.innerHTML = manifest.metadata.title;
                }
                chapterTitle = void 0;
                spineItem = manifest.getSpineItem(currentLocation);
                if (spineItem !== null) {
                  chapterTitle = spineItem.title;
                }
                if (!chapterTitle) {
                  tocItem = manifest.getTOCItem(currentLocation);
                  if (tocItem !== null && tocItem.title) {
                    chapterTitle = tocItem.title;
                  }
                }
                if (chapterTitle) {
                  this.chapterTitle.innerHTML = "(" + chapterTitle + ")";
                } else {
                  this.chapterTitle.innerHTML = "(Current Chapter)";
                }
                if (this.eventHandler) {
                  this.eventHandler.setupEvents(this.iframe.contentDocument);
                }
                if (!this.annotator) return [3, 4];
                return [4, this.saveCurrentReadingPosition()];
              case 3:
                a.sent();
                a.label = 4;
              case 4:
                this.hideLoadingMessage();
                this.showIframeContents();
                Object.defineProperty(
                  this.iframe.contentWindow.navigator,
                  "epubReadingSystem",
                  {
                    value: epubReadingSystem,
                    writable: false
                  }
                );
                return [
                  2,
                  new Promise(function (resolve) {
                    return resolve();
                  })
                ];
              case 5:
                err4 = a.sent();
                this.abortOnError();
                return [
                  2,
                  new Promise(function (, reject) {
                    return reject(err4);
                  }).catch(function () {})
                ];
              case 6:
                return [2];
            }
          });
        });
      };
      IFrameNavigator.prototype.abortOnError = function () {
        this.errorMessage.style.display = "block";
        if (this.isLoading) {
          this.hideLoadingMessage();
        }
      };
      IFrameNavigator.prototype.tryAgain = function () {
        this.iframe.src = this.iframe.src;
        this.enableOffline();
      };
      IFrameNavigator.prototype.handleClick = function () {
        window.parent.postMessage("backButtonClicked", "*");
      };
      IFrameNavigator.prototype.goBack = function () {
        window.history.back();
      };
      IFrameNavigator.prototype.isDisplayed = function (element) {
        return element.className.indexOf(" active") !== -1;
      };
      IFrameNavigator.prototype.showElement = function (element, control) {
        element.className = element.className.replace(" inactive", "");
        if (element.className.indexOf(" active") === -1) {
          element.className += " active";
        }
        element.setAttribute("aria-hidden", "false");
        if (control) {
          control.setAttribute("aria-expanded", "true");
          const openIcon = control.querySelector(".icon.open");
          if (
            openIcon &&
            (openIcon.getAttribute("class") || "").indexOf(" inactive-icon") ===
              -1
          ) {
            const newIconClass =
              (openIcon.getAttribute("class") || "") + " inactive-icon";
            openIcon.setAttribute("class", newIconClass);
          }
          const closeIcon = control.querySelector(".icon.close");
          if (closeIcon) {
            const newIconClass = (closeIcon.getAttribute("class") || "").replace(
              " inactive-icon",
              ""
            );
            closeIcon.setAttribute("class", newIconClass);
          }
        }
        // Add buttons and links in the element to the tab order.
        const buttons = Array.prototype.slice.call(
          element.querySelectorAll("button")
        );
        const links = Array.prototype.slice.call(element.querySelectorAll("a"));
        for (const i = 0, buttons1 = buttons; i < buttons1.length; i++) {
          const button = buttons1[i];
          button.tabIndex = 0;
        }
        for (const a = 0, links2 = links; a < links2.length; a++) {
          const link = links2[a];
          link.tabIndex = 0;
        }
      };
      IFrameNavigator.prototype.hideElement = function (element, control) {
        element.className = element.className.replace(" active", "");
        if (element.className.indexOf(" inactive") === -1) {
          element.className += " inactive";
        }
        element.setAttribute("aria-hidden", "true");
        if (control) {
          control.setAttribute("aria-expanded", "false");
          const openIcon = control.querySelector(".icon.open");
          if (openIcon) {
            const newIconClass = (openIcon.getAttribute("class") || "").replace(
              " inactive-icon",
              ""
            );
            openIcon.setAttribute("class", newIconClass);
          }
          const closeIcon = control.querySelector(".icon.close");
          if (
            closeIcon &&
            (closeIcon.getAttribute("class") || "").indexOf(
              " inactive-icon"
            ) === -1
          ) {
            const newIconClass =
              (closeIcon.getAttribute("class") || "") + " inactive-icon";
            closeIcon.setAttribute("class", newIconClass);
          }
        }
        // Remove buttons and links in the element from the tab order.
        const buttons = Array.prototype.slice.call(
          element.querySelectorAll("button")
        );
        const links = Array.prototype.slice.call(element.querySelectorAll("a"));
        for (const i = 0, buttons2 = buttons; i < buttons2.length; i++) {
          const button = buttons2[i];
          button.tabIndex = -1;
        }
        for (const a = 0, links3 = links; a < links3.length; a++) {
          const link = links3[a];
          link.tabIndex = -1;
        }
      };
      IFrameNavigator.prototype.showModal = function (modal, control) {
        // Hide the rest of the page for screen readers.
        this.pageContainer.setAttribute("aria-hidden", "true");
        this.iframe.setAttribute("aria-hidden", "true");
        this.scrollingSuggestion.setAttribute("aria-hidden", "true");
        if (this.upLink) {
          this.upLink.setAttribute("aria-hidden", "true");
        }
        if (this.fullscreen) {
          this.fullscreen.setAttribute("aria-hidden", "true");
        }
        this.contentsControl.setAttribute("aria-hidden", "true");
        this.settingsControl.setAttribute("aria-hidden", "true");
        this.linksBottom.setAttribute("aria-hidden", "true");
        this.loadingMessage.setAttribute("aria-hidden", "true");
        this.errorMessage.setAttribute("aria-hidden", "true");
        this.infoTop.setAttribute("aria-hidden", "true");
        this.infoBottom.setAttribute("aria-hidden", "true");
        if (control) {
          control.setAttribute("aria-hidden", "false");
        }
        this.showElement(modal, control);
      };
      IFrameNavigator.prototype.hideModal = function (modal, control) {
        // Restore the page for screen readers.
        this.pageContainer.setAttribute("aria-hidden", "false");
        this.iframe.setAttribute("aria-hidden", "false");
        this.scrollingSuggestion.setAttribute("aria-hidden", "false");
        if (this.upLink) {
          this.upLink.setAttribute("aria-hidden", "false");
        }
        if (this.fullscreen) {
          this.fullscreen.setAttribute("aria-hidden", "false");
        }
        this.contentsControl.setAttribute("aria-hidden", "false");
        this.settingsControl.setAttribute("aria-hidden", "false");
        this.linksBottom.setAttribute("aria-hidden", "false");
        this.loadingMessage.setAttribute("aria-hidden", "false");
        this.errorMessage.setAttribute("aria-hidden", "false");
        this.infoTop.setAttribute("aria-hidden", "false");
        this.infoBottom.setAttribute("aria-hidden", "false");
        this.hideElement(modal, control);
      };
      IFrameNavigator.prototype.toggleFullscreenIcon = function () {
        if (this.fullscreen) {
          const activeIcon = this.fullscreen.querySelector(".icon.active-icon");
          const inactiveIcon = this.fullscreen.querySelector(
            ".icon.inactive-icon"
          );
          if (
            activeIcon &&
            (activeIcon.getAttribute("class") || "").indexOf(
              " inactive-icon"
            ) === -1
          ) {
            const newIconClass = "icon inactive-icon";
            activeIcon.setAttribute("class", newIconClass);
          }
          if (inactiveIcon) {
            const newIconClass = "icon active-icon";
            inactiveIcon.setAttribute("class", newIconClass);
          }
        }
      };
      IFrameNavigator.prototype.toggleFullscreen = function () {
        if (this.fullscreen) {
          const doc = document;
          const docEl = document.documentElement;
          const requestFullScreen =
            docEl.requestFullscreen ||
            docEl.mozRequestFullScreen ||
            docEl.webkitRequestFullScreen ||
            docEl.msRequestFullscreen;
          const cancelFullScreen =
            doc.exitFullscreen ||
            doc.mozCancelFullScreen ||
            doc.webkitExitFullscreen ||
            doc.msExitFullscreen;
          if (
            !doc.fullscreenElement &&
            !doc.mozFullScreenElement &&
            !doc.webkitFullscreenElement &&
            !doc.msFullscreenElement
          ) {
            requestFullScreen.call(docEl);
          } else {
            cancelFullScreen.call(doc);
          }
        }
      };
      // private toggleDisplay(element: HTMLDivElement | HTMLUListElement, control?: HTMLAnchorElement | HTMLButtonElement): void {
      //     if (!this.isDisplayed(element)) {
      //         this.showElement(element, control);
      //     } else {
      //         this.hideElement(element, control);
      //     }
      // }
      IFrameNavigator.prototype.toggleModal = function (modal, control) {
        if (!this.isDisplayed(modal)) {
          this.showModal(modal, control);
        } else {
          this.hideModal(modal, control);
        }
      };
      IFrameNavigator.prototype.handleToggleLinksClick = function (event) {
        this.hideTOC();
        this.hideSettings();
        // this.toggleDisplay(this.links, this.menuControl);
        // if (this.settings.getSelectedView() === this.scroller) {
        //     if (!this.scroller.atBottom()) {
        //         this.toggleDisplay(this.linksBottom);
        //     }
        // }
        event.preventDefault();
        event.stopPropagation();
      };
      IFrameNavigator.prototype.handlePreviousPageClick = function (event) {
        if (this.paginator) {
          if (this.paginator.onFirstPage()) {
            if (this.previousChapterLink.hasAttribute("href")) {
              const position = {
                resource: this.previousChapterLink.href,
                position: 1
              };
              this.navigate(position);
            }
          } else {
            this.paginator.goToPreviousPage();
            this.updatePositionInfo();
            this.saveCurrentReadingPosition();
          }
          event.preventDefault();
          event.stopPropagation();
        }
      };
      IFrameNavigator.prototype.handleNextPageClick = function (event) {
        if (this.paginator) {
          if (this.paginator.onLastPage()) {
            if (this.nextChapterLink.hasAttribute("href")) {
              const position = {
                resource: this.nextChapterLink.href,
                position: 0
              };
              this.navigate(position);
            }
          } else {
            this.paginator.goToNextPage();
            this.updatePositionInfo();
            this.saveCurrentReadingPosition();
          }
          event.preventDefault();
          event.stopPropagation();
        }
      };
      // private handleLeftHover(): void {
      //     if (this.paginator) {
      //         if (this.paginator.onFirstPage() && !this.previousChapterLink.hasAttribute("href")) {
      //             this.iframe.className = "";
      //         } else {
      //             this.iframe.className = "left-hover";
      //         }
      //     }
      // }
      // private handleRightHover(): void {
      //     if (this.paginator) {
      //         if (this.paginator.onLastPage() && !this.nextChapterLink.hasAttribute("href")) {
      //             this.iframe.className = "";
      //         } else {
      //             this.iframe.className = "right-hover";
      //         }
      //     }
      // }
      // private handleRemoveHover(): void {
      //     this.iframe.className = "";
      // }
      IFrameNavigator.prototype.handleInternalLink = function (event) {
        const element = event.target;
        const currentLocation = this.iframe.src.split("#")[0];
        if (
          this.iframe.contentDocument &&
          this.iframe.contentDocument.location &&
          this.iframe.contentDocument.location.href
        ) {
          currentLocation = this.iframe.contentDocument.location.href.split(
            "#"
          )[0];
        }
        if (element && element.tagName.toLowerCase() === "a") {
          if (element.href.split("#")[0] === currentLocation) {
            const elementId = element.href.split("#")[1];
            this.settings.getSelectedView().goToElement(elementId, true);
            this.updatePositionInfo();
            this.saveCurrentReadingPosition();
            event.preventDefault();
            event.stopPropagation();
          }
        }
      };
      IFrameNavigator.prototype.handleIframeFocus = function () {
        const body = HTMLUtilities.findRequiredIframeElement(
          this.iframe.contentDocument,
          "body"
        );
        const iframeContainer = document.getElementById("iframe-container");
        if (iframeContainer) {
          iframeContainer.blur();
        }
        body.focus();
      };
      IFrameNavigator.prototype.handleResize = function () {
        const selectedView = this.settings.getSelectedView();
        const oldPosition = selectedView.getCurrentPosition();
        const fontSize = this.settings.getSelectedFontSize();
        const body = HTMLUtilities.findRequiredIframeElement(
          this.iframe.contentDocument,
          "body"
        );
        body.style.fontSize = fontSize;
        body.style.lineHeight = "1.5";
        // const fontSizeNumber = parseInt(fontSize.slice(0, -2));
        // let sideMargin = fontSizeNumber * 2;
        // if (BrowserUtilities.getWidth() > fontSizeNumber * 45) {
        //     const extraMargin = Math.floor((BrowserUtilities.getWidth() - fontSizeNumber * 40) / 2);
        //     sideMargin = sideMargin + extraMargin;
        // }
        // // if (this.paginator) {
        //     this.paginator.sideMargin = sideMargin;
        // }
        // if (this.scroller) {
        //     this.scroller.sideMargin = sideMargin;
        // }
        // If the links are hidden, show them temporarily
        // to determine the top and bottom heights.
        // const linksHidden = !this.isDisplayed(this.links);
        // if (linksHidden) {
        //     this.toggleDisplay(this.links);
        // }
        const topHeight = this.links.clientHeight;
        this.infoTop.style.height = topHeight + "px";
        // if (linksHidden) {
        //     this.toggleDisplay(this.links);
        // }
        // const linksBottomHidden = !this.isDisplayed(this.linksBottom);
        // if (linksBottomHidden) {
        //     this.toggleDisplay(this.linksBottom);
        // }
        const bottomHeight = this.linksBottom.clientHeight;
        this.infoBottom.style.height = bottomHeight + "px";
        // if (linksBottomHidden) {
        //     this.toggleDisplay(this.linksBottom);
        // }
        selectedView.goToPosition(oldPosition);
        this.updatePositionInfo();
      };
      IFrameNavigator.prototype.updatePositionInfo = function () {
        if (this.settings.getSelectedView() === this.paginator) {
          const currentPage = Math.round(this.paginator.getCurrentPage());
          const pageCount = Math.round(this.paginator.getPageCount());
          this.chapterPosition.innerHTML =
            "Page " + currentPage + " of " + pageCount;
        } else {
          this.chapterPosition.innerHTML = "";
        }
      };
      IFrameNavigator.prototype.handlePreviousChapterClick = function (event) {
        if (this.previousChapterLink.hasAttribute("href")) {
          const position = {
            resource: this.previousChapterLink.href,
            position: 0
          };
          this.navigate(position);
        }
        event.preventDefault();
        event.stopPropagation();
      };
      IFrameNavigator.prototype.handleNextChapterClick = function (event) {
        if (this.nextChapterLink.hasAttribute("href")) {
          const position = {
            resource: this.nextChapterLink.href,
            position: 0
          };
          this.navigate(position);
        }
        event.preventDefault();
        event.stopPropagation();
      };
      IFrameNavigator.prototype.handleContentsClick = function (event) {
        this.hideSettings();
        this.toggleModal(this.tocView, this.contentsControl);
        // While the TOC is displayed, prevent scrolling in the book.
        if (this.settings.getSelectedView() === this.scroller) {
          if (this.isDisplayed(this.tocView)) {
            document.body.style.overflow = "hidden";
          } else {
            document.body.style.overflow = "auto";
          }
        }
        event.preventDefault();
        event.stopPropagation();
      };
      IFrameNavigator.prototype.hideTOC = function () {
        this.hideModal(this.tocView, this.contentsControl);
        if (this.settings.getSelectedView() === this.scroller) {
          document.body.style.overflow = "auto";
        }
      };
      IFrameNavigator.prototype.hideTOCOnEscape = function (event) {
        const ESCAPEKEY = 27;
        if (this.isDisplayed(this.tocView) && event.keyCode === ESCAPEKEY) {
          this.hideTOC();
        }
      };
      IFrameNavigator.prototype.setActiveTOCItem = function (resource) {
        const allItems = Array.prototype.slice.call(
          this.tocView.querySelectorAll("li > a")
        );
        for (const i = 0, allItems1 = allItems; i < allItems1.length; i++) {
          const item = allItems1[i];
          item.className = "";
        }
        const activeItem = this.tocView.querySelector(
          'li > a[href^="' + resource + '"]'
        );
        if (activeItem) {
          activeItem.className = "active";
        }
      };
      IFrameNavigator.prototype.handleSettingsClick = function (event) {
        this.hideTOC();
        this.toggleModal(this.settingsView, this.settingsControl);
        event.preventDefault();
        event.stopPropagation();
      };
      IFrameNavigator.prototype.hideSettings = function () {
        this.hideModal(this.settingsView, this.settingsControl);
      };
      IFrameNavigator.prototype.hideSettingsOnEscape = function (event) {
        const ESCAPEKEY = 27;
        if (
          this.isDisplayed(this.settingsView) &&
          event.keyCode === ESCAPEKEY
        ) {
          this.hideSettings();
        }
      };
      IFrameNavigator.prototype.navigate = function (readingPosition) {
        this.hideIframeContents();
        this.showLoadingMessageAfterDelay();
        this.newPosition = readingPosition;
        if (readingPosition.resource.indexOf("#") === -1) {
          this.iframe.src = readingPosition.resource;
        } else {
          // We're navigating to an anchor within the resource,
          // rather than the resource itself. Go to the resource
          // first, then go to the anchor.
          this.newElementId = readingPosition.resource.slice(
            readingPosition.resource.indexOf("#") + 1
          );
          const newResource = readingPosition.resource.slice(
            0,
            readingPosition.resource.indexOf("#")
          );
          if (newResource === this.iframe.src) {
            // The resource isn't changing, but handle it like a new
            // iframe load to hide the menus and popups and go to the
            // new element.
            this.handleIFrameLoad();
          } else {
            this.iframe.src = newResource;
          }
        }
      };
      IFrameNavigator.prototype.showIframeContents = function () {
        const this = this;
        this.isBeingStyled = false;
        // We set a timeOut so that settings can be applied when opacity is still 0
        setTimeout(function () {
          if (!this.isBeingStyled) {
            this.iframe.style.opacity = "1";
          }
        }, 150);
      };
      IFrameNavigator.prototype.showLoadingMessageAfterDelay = function () {
        const this = this;
        this.isLoading = true;
        setTimeout(function () {
          if (this.isLoading) {
            this.loadingMessage.style.display = "block";
            this.loadingMessage.classList.add("is-loading");
          }
        }, 200);
      };
      IFrameNavigator.prototype.hideIframeContents = function () {
        this.isBeingStyled = true;
        this.iframe.style.opacity = "0";
      };
      IFrameNavigator.prototype.hideLoadingMessage = function () {
        this.isLoading = false;
        this.loadingMessage.style.display = "none";
        this.loadingMessage.classList.remove("is-loading");
      };
      IFrameNavigator.prototype.saveCurrentReadingPosition = function () {
        return awaiter(this, void 0, void 0, function () {
          const resource, position;
          return generator(this, function (a) {
            if (this.annotator) {
              resource = this.iframe.src;
              position = this.settings.getSelectedView().getCurrentPosition();
              return [
                2,
                this.annotator.saveLastReadingPosition({
                  resource: resource,
                  position: position
                })
              ];
            } else {
              return [
                2,
                new Promise(function (resolve) {
                  return resolve();
                })
              ];
            }
            return [2];
          });
        });
      };
      return IFrameNavigator;
    })();
    exports.default = IFrameNavigator;
    return exports;
  })(IFrameNavigator, Cacher, Manifest, EventHandler, HTMLUtilities, IconLib);
  LocalAnnotator = (function (exports) {
    Object.defineProperty(exports, "esModule", { value: true });
    /** Annotator that stores annotations locally, in the browser. */
    const LocalAnnotator = (function () {
      function LocalAnnotator(config) {
        this.store = config.store;
      }
      LocalAnnotator.prototype.getLastReadingPosition = function () {
        return awaiter(this, void 0, void 0, function () {
          const positionString, position1;
          return generator(this, function (a) {
            switch (a.label) {
              case 0:
                return [
                  4,
                  this.store.get(LocalAnnotator.LASTREADINGPOSITION)
                ];
              case 1:
                positionString = a.sent();
                if (positionString) {
                  position1 = JSON.parse(positionString);
                  return [
                    2,
                    new Promise(function (resolve) {
                      return resolve(position1);
                    })
                  ];
                }
                return [
                  2,
                  new Promise(function (resolve) {
                    return resolve();
                  })
                ];
            }
          });
        });
      };
      LocalAnnotator.prototype.saveLastReadingPosition = function (position) {
        return awaiter(this, void 0, void 0, function () {
          const positionString;
          return generator(this, function (a) {
            switch (a.label) {
              case 0:
                positionString = JSON.stringify(position);
                return [
                  4,
                  this.store.set(
                    LocalAnnotator.LASTREADINGPOSITION,
                    positionString
                  )
                ];
              case 1:
                a.sent();
                return [
                  2,
                  new Promise(function (resolve) {
                    return resolve();
                  })
                ];
            }
          });
        });
      };
      LocalAnnotator.LASTREADINGPOSITION = "last-reading-position";
      return LocalAnnotator;
    })();
    exports.default = LocalAnnotator;
    return exports;
  })(LocalAnnotator);
  MemoryStore = (function (exports) {
    Object.defineProperty(exports, "esModule", { value: true });
    /** Class that stores key/value pairs in memory. */
    const MemoryStore = (function () {
      function MemoryStore() {
        this.store = {};
      }
      MemoryStore.prototype.get = function (key) {
        const value = this.store[key] || null;
        return new Promise(function (resolve) {
          return resolve(value);
        });
      };
      MemoryStore.prototype.set = function (key, value) {
        this.store[key] = value;
        return new Promise(function (resolve) {
          return resolve();
        });
      };
      return MemoryStore;
    })();
    exports.default = MemoryStore;
    return exports;
  })(MemoryStore);
  LocalStorageStore = (function (exports, MemoryStore1) {
    Object.defineProperty(exports, "esModule", { value: true });
    /** Class that stores key/value pairs in localStorage if possible
  but falls back to an in-memory store. */
    const LocalStorageStore = (function () {
      function LocalStorageStore(config) {
        this.prefix = config.prefix;
        try {
          // In some browsers (eg iOS Safari in private mode),
          // localStorage exists but throws an exception when
          // you try to write to it.
          const testKey = config.prefix + "-" + String(Math.random());
          window.localStorage.setItem(testKey, "test");
          window.localStorage.removeItem(testKey);
          this.fallbackStore = null;
        } catch (e) {
          this.fallbackStore = new MemoryStore1.default();
        }
      }
      LocalStorageStore.prototype.getLocalStorageKey = function (key) {
        return this.prefix + "-" + key;
      };
      LocalStorageStore.prototype.get = function (key) {
        return awaiter(this, void 0, void 0, function () {
          const value;
          return generator(this, function (a) {
            switch (a.label) {
              case 0:
                value = null;
                if (this.fallbackStore) return [3, 1];
                value = window.localStorage.getItem(
                  this.getLocalStorageKey(key)
                );
                return [3, 3];
              case 1:
                return [4, this.fallbackStore.get(key)];
              case 2:
                value = a.sent();
                a.label = 3;
              case 3:
                return [
                  2,
                  new Promise(function (resolve) {
                    return resolve(value);
                  })
                ];
            }
          });
        });
      };
      LocalStorageStore.prototype.set = function (key, value) {
        return awaiter(this, void 0, void 0, function () {
          return generator(this, function (a) {
            switch (a.label) {
              case 0:
                if (this.fallbackStore) return [3, 1];
                window.localStorage.setItem(
                  this.getLocalStorageKey(key),
                  value
                );
                return [3, 3];
              case 1:
                return [4, this.fallbackStore.set(key, value)];
              case 2:
                a.sent();
                a.label = 3;
              case 3:
                return [
                  2,
                  new Promise(function (resolve) {
                    return resolve();
                  })
                ];
            }
          });
        });
      };
      return LocalStorageStore;
    })();
    exports.default = LocalStorageStore;
    return exports;
  })(LocalStorageStore, MemoryStore);
  ServiceWorkerCacher = (function (exports, Cacher2, Manifest2) {
    Object.defineProperty(exports, "esModule", { value: true });
    /** Class that caches responses using ServiceWorker's Cache API, and optionally
  falls back to the application cache if service workers aren't available. */
    const ServiceWorkerCacher = (function () {
      /** Create a ServiceWorkerCacher. */
      function ServiceWorkerCacher(config) {
        this.cacheStatus = Cacher2.CacheStatus.Uncached;
        this.statusUpdateCallback = function () {};
        this.serviceWorkerUrl =
          config.serviceWorkerUrl || new URL("sw.js", config.manifestUrl.href);
        this.staticFileUrls = config.staticFileUrls || [];
        this.store = config.store;
        this.manifestUrl = config.manifestUrl;
        const protocol = window.location.protocol;
        this.areServiceWorkersSupported =
          !!navigator.serviceWorker && !!window.caches && protocol === "https:";
      }
      ServiceWorkerCacher.prototype.enable = function () {
        return awaiter(this, void 0, void 0, function () {
          const err5;
          return generator(this, function (a) {
            switch (a.label) {
              case 0:
                if (
                  !(
                    this.areServiceWorkersSupported &&
                    this.cacheStatus !== Cacher2.CacheStatus.Downloaded
                  )
                )
                  return [3, 4];
                this.cacheStatus = Cacher2.CacheStatus.Downloading;
                this.updateStatus();
                navigator.serviceWorker.register(this.serviceWorkerUrl.href);
                a.label = 1;
              case 1:
                a.trys.push([1, 3, , 4]);
                return [4, this.verifyAndCacheManifest(this.manifestUrl)];
              case 2:
                a.sent();
                this.cacheStatus = Cacher2.CacheStatus.Downloaded;
                this.updateStatus();
                return [3, 4];
              case 3:
                err5 = a.sent();
                this.cacheStatus = Cacher2.CacheStatus.Error;
                this.updateStatus();
                return [3, 4];
              case 4:
                return [
                  2,
                  new Promise(function (resolve) {
                    return resolve();
                  })
                ];
            }
          });
        });
      };
      ServiceWorkerCacher.prototype.verifyAndCacheManifest = function (
        manifestUrl
      ) {
        return awaiter(this, void 0, void 0, function () {
          const urlsToCache,
            i,
            a,
            url,
            promises,
            b,
            promises1,
            promise,
            err6;
          return generator(this, function (c) {
            switch (c.label) {
              case 0:
                return [4, navigator.serviceWorker.ready];
              case 1:
                c.sent();
                c.label = 2;
              case 2:
                c.trys.push([2, 7, , 8]);
                urlsToCache = [manifestUrl.href];
                for (i = 0, a = this.staticFileUrls; i < a.length; i++) {
                  url = a[i];
                  urlsToCache.push(url.href);
                }
                promises = [
                  this.cacheManifest(manifestUrl),
                  this.cacheUrls(urlsToCache, manifestUrl)
                ];
                (b = 0), (promises1 = promises);
                c.label = 3;
              case 3:
                if (!(b < promises1.length)) return [3, 6];
                promise = promises1[b];
                return [4, promise];
              case 4:
                c.sent();
                c.label = 5;
              case 5:
                b++;
                return [3, 3];
              case 6:
                return [
                  2,
                  new Promise(function (resolve) {
                    return resolve();
                  })
                ];
              case 7:
                err6 = c.sent();
                return [
                  2,
                  new Promise(function (, reject) {
                    return reject(err6);
                  })
                ];
              case 8:
                return [2];
            }
          });
        });
      };
      ServiceWorkerCacher.prototype.cacheUrls = function (urls, manifestUrl) {
        return awaiter(this, void 0, void 0, function () {
          const cache;
          return generator(this, function (a) {
            switch (a.label) {
              case 0:
                return [4, window.caches.open(manifestUrl.href)];
              case 1:
                cache = a.sent();
                return [
                  2,
                  cache.addAll(
                    urls.map(function (url) {
                      return new URL(url, manifestUrl.href).href;
                    })
                  )
                ];
            }
          });
        });
      };
      ServiceWorkerCacher.prototype.cacheManifest = function (manifestUrl) {
        return awaiter(this, void 0, void 0, function () {
          const manifest, promises, i, promises2, promise;
          return generator(this, function (a) {
            switch (a.label) {
              case 0:
                return [
                  4,
                  Manifest2.default.getManifest(manifestUrl, this.store)
                ];
              case 1:
                manifest = a.sent();
                promises = [
                  this.cacheSpine(manifest, manifestUrl),
                  this.cacheResources(manifest, manifestUrl)
                ];
                (i = 0), (promises2 = promises);
                a.label = 2;
              case 2:
                if (!(i < promises2.length)) return [3, 5];
                promise = promises2[i];
                return [4, promise];
              case 3:
                a.sent();
                a.label = 4;
              case 4:
                i++;
                return [3, 2];
              case 5:
                return [
                  2,
                  new Promise(function (resolve) {
                    return resolve();
                  })
                ];
            }
          });
        });
      };
      ServiceWorkerCacher.prototype.cacheSpine = function (
        manifest,
        manifestUrl
      ) {
        return awaiter(this, void 0, void 0, function () {
          const urls, i, a, resource;
          return generator(this, function (b) {
            switch (b.label) {
              case 0:
                urls = [];
                for (i = 0, a = manifest.spine; i < a.length; i++) {
                  resource = a[i];
                  if (resource.href) {
                    urls.push(resource.href);
                  }
                }
                return [4, this.cacheUrls(urls, manifestUrl)];
              case 1:
                return [2, b.sent()];
            }
          });
        });
      };
      ServiceWorkerCacher.prototype.cacheResources = function (
        manifest,
        manifestUrl
      ) {
        return awaiter(this, void 0, void 0, function () {
          const urls, i, a, resource;
          return generator(this, function (b) {
            switch (b.label) {
              case 0:
                urls = [];
                for (i = 0, a = manifest.resources; i < a.length; i++) {
                  resource = a[i];
                  if (resource.href) {
                    urls.push(resource.href);
                  }
                }
                return [4, this.cacheUrls(urls, manifestUrl)];
              case 1:
                return [2, b.sent()];
            }
          });
        });
      };
      ServiceWorkerCacher.prototype.onStatusUpdate = function (callback) {
        this.statusUpdateCallback = callback;
        this.updateStatus();
      };
      ServiceWorkerCacher.prototype.getStatus = function () {
        return this.cacheStatus;
      };
      ServiceWorkerCacher.prototype.updateStatus = function () {
        this.statusUpdateCallback(this.cacheStatus);
      };
      return ServiceWorkerCacher;
    })();
    exports.default = ServiceWorkerCacher;
    return exports;
  })(ServiceWorkerCacher, Cacher, Manifest);
  app = (function (
    exports,
    LocalStorageStore1,
    ServiceWorkerCacher1,
    IFrameNavigator1,
    PublisherFont1,
    SerifFont1,
    SansFont1,
    DayTheme1,
    SepiaTheme1,
    NightTheme1,
    ColumnsPaginatedBookView1,
    ScrollingBookView1,
    BookSettings1,
    LocalAnnotator1
  ) {
    Object.defineProperty(exports, "esModule", { value: true });
    const app = function (element, manifestUrl) {
      return awaiter(void 0, void 0, void 0, function () {
        const bookStore,
          cacher,
          annotator,
          publisher,
          serif,
          sans,
          fontSizes,
          day,
          sepia,
          night,
          paginator,
          scroller,
          settingsStore,
          settings;
        return generator(this, function (a) {
          switch (a.label) {
            case 0:
              bookStore = new LocalStorageStore1.default({
                prefix: manifestUrl.href
              });
              cacher = new ServiceWorkerCacher1.default({
                store: bookStore,
                manifestUrl: manifestUrl
              });
              annotator = new LocalAnnotator1.default({ store: bookStore });
              publisher = new PublisherFont1.default();
              serif = new SerifFont1.default();
              sans = new SansFont1.default();
              fontSizes = [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32];
              day = new DayTheme1.default();
              sepia = new SepiaTheme1.default();
              night = new NightTheme1.default();
              paginator = new ColumnsPaginatedBookView1.default();
              scroller = new ScrollingBookView1.default();
              settingsStore = new LocalStorageStore1.default({
                prefix: "cassis-reader"
              });
              return [
                4,
                BookSettings1.default.create({
                  store: settingsStore,
                  bookFonts: [publisher, serif, sans],
                  fontSizesInPixels: fontSizes,
                  defaultFontSizeInPixels: 20,
                  bookThemes: [day, sepia, night],
                  bookViews: [paginator, scroller]
                })
              ];
            case 1:
              settings = a.sent();
              return [
                4,
                IFrameNavigator1.default.create({
                  element: element,
                  manifestUrl: manifestUrl,
                  store: bookStore,
                  cacher: cacher,
                  settings: settings,
                  annotator: annotator,
                  publisher: publisher,
                  serif: serif,
                  sans: sans,
                  day: day,
                  sepia: sepia,
                  night: night,
                  paginator: paginator,
                  scroller: scroller
                })
              ];
            case 2:
              return [2, a.sent()];
          }
        });
      });
    };
    exports.default = app;
    return exports;
  })(
    app,
    LocalStorageStore,
    ServiceWorkerCacher,
    IFrameNavigator,
    PublisherFont,
    SerifFont,
    SansFont,
    DayTheme,
    SepiaTheme,
    NightTheme,
    ColumnsPaginatedBookView,
    ScrollingBookView,
    BookSettings,
    LocalAnnotator
  );
  index = (function (
    exports,
    Cacher3,
    BookSettings2,
    MemoryStore2,
    LocalStorageStore2,
    ServiceWorkerCacher2,
    LocalAnnotator2,
    PublisherFont2,
    SerifFont2,
    SansFont2,
    DayTheme2,
    SepiaTheme2,
    NightTheme2,
    ColumnsPaginatedBookView2,
    ScrollingBookView2,
    EventHandler2,
    IconLib1,
    IFrameNavigator2
  ) {
    function export(m) {
      for (const p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "esModule", { value: true });
    export(Cacher3);
    export(BookSettings2);
    export(MemoryStore2);
    export(LocalStorageStore2);
    export(ServiceWorkerCacher2);
    export(LocalAnnotator2);
    export(PublisherFont2);
    export(SerifFont2);
    export(SansFont2);
    export(DayTheme2);
    export(SepiaTheme2);
    export(NightTheme2);
    export(ColumnsPaginatedBookView2);
    export(ScrollingBookView2);
    export(EventHandler2);
    export(IconLib1);
    export(IFrameNavigator2);
    return exports;
  })(
    index,
    Cacher,
    BookSettings,
    MemoryStore,
    LocalStorageStore,
    ServiceWorkerCacher,
    LocalAnnotator,
    PublisherFont,
    SerifFont,
    SansFont,
    DayTheme,
    SepiaTheme,
    NightTheme,
    ColumnsPaginatedBookView,
    ScrollingBookView,
    EventHandler,
    IconLib,
    IFrameNavigator
  );
})();
