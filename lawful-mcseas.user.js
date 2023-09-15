// ==UserScript==
// @name               lawful-mcseas
// @name:en            Lawful MC seas
// @name:zh-CN         秩序心海
// @namespace          https://mcseas.club/home.php?mod=space&uid=95082
// @version            0.3.4-alpha
// @author             miyoi
// @description:en     Improve the user experience of mcseas.
// @description:zh-CN  改善「混沌心海」论坛的使用体验。
// @license            MIT
// @icon               https://mcseas.club/favicon.ico
// @homepage           https://mcseas.club/forum.php?mod=viewthread&tid=50579
// @match              *://mcseas.club/*
// @require            https://unpkg.com/heti/umd/heti-addon.min.js
// @resource           css  https://unpkg.com/heti/umd/heti.min.css
// @grant              GM_addStyle
// @grant              GM_deleteValue
// @grant              GM_getResourceText
// @grant              GM_getValue
// @grant              GM_listValues
// @grant              GM_log
// @grant              GM_openInTab
// @grant              GM_registerMenuCommand
// @grant              GM_setValue
// @grant              GM_unregisterMenuCommand
// @run-at             document-end
// ==/UserScript==

(function () {
  'use strict';

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };
  var _a, _b, _c, _d;
  var _GM_addStyle = /* @__PURE__ */ (() => typeof GM_addStyle != "undefined" ? GM_addStyle : void 0)();
  var _GM_deleteValue = /* @__PURE__ */ (() => typeof GM_deleteValue != "undefined" ? GM_deleteValue : void 0)();
  var _GM_getResourceText = /* @__PURE__ */ (() => typeof GM_getResourceText != "undefined" ? GM_getResourceText : void 0)();
  var _GM_getValue = /* @__PURE__ */ (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
  var _GM_listValues = /* @__PURE__ */ (() => typeof GM_listValues != "undefined" ? GM_listValues : void 0)();
  var _GM_log = /* @__PURE__ */ (() => typeof GM_log != "undefined" ? GM_log : void 0)();
  var _GM_openInTab = /* @__PURE__ */ (() => typeof GM_openInTab != "undefined" ? GM_openInTab : void 0)();
  var _GM_registerMenuCommand = /* @__PURE__ */ (() => typeof GM_registerMenuCommand != "undefined" ? GM_registerMenuCommand : void 0)();
  var _GM_setValue = /* @__PURE__ */ (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
  var _GM_unregisterMenuCommand = /* @__PURE__ */ (() => typeof GM_unregisterMenuCommand != "undefined" ? GM_unregisterMenuCommand : void 0)();
  var _monkeyWindow = /* @__PURE__ */ (() => window)();
  const name = "lawful-mcseas";
  const version = "0.3.4";
  const type = "module";
  const scripts = {
    dev: "vite",
    build: "tsc && vite build",
    preview: "vite preview"
  };
  const devDependencies = {
    typescript: "^5.1.6",
    "unplugin-auto-import": "^0.16.6",
    vite: "^4.4.8",
    "vite-plugin-monkey": "^3.4.0"
  };
  const pkg = {
    name,
    "private": true,
    version,
    type,
    scripts,
    devDependencies
  };
  class Utils {
    current() {
      const t = /* @__PURE__ */ new Date();
      const pad = (pad_target, pad_length = 2, pad_string = "0") => {
        return pad_target.toString().padStart(pad_length, pad_string);
      };
      return [pad(t.getFullYear(), 4), pad(t.getMonth()), pad(t.getDate())].join("-") + " " + [pad(t.getHours()), pad(t.getMinutes()), pad(t.getSeconds())].join(":");
    }
    debug(...args) {
      _GM_log(`${this.current()} | DEBUG |`, ...args);
    }
    log(...args) {
      console.log(`${this.current()} [秩序心海]`, ...args);
    }
  }
  class Config {
    constructor() {
      __publicField(this, "version", `${pkg.version}-alpha`);
      __publicField(this, "auto_format");
      __publicField(this, "font_name");
      __publicField(this, "font_size");
      __publicField(this, "only_format_lz");
      __publicField(this, "block_ip_warning");
      __publicField(this, "block_email_warning");
      this.load();
    }
    load() {
      this.auto_format = _GM_getValue("cfg_auto_format") !== "false";
      this.font_name = _GM_getValue("cfg_font_name") || "小赖字体 等宽 SC";
      this.font_size = Number(_GM_getValue("cfg_font_size"));
      this.font_size = this.font_size > 0 ? this.font_size : 16;
      this.only_format_lz = _GM_getValue("cfg_only_format_lz") !== "false";
      this.block_ip_warning = _GM_getValue("cfg_block_ip_warning") === "true";
      this.block_email_warning = _GM_getValue("cfg_block_email_warning") === "true";
    }
    save(key, value) {
      _GM_setValue(`cfg_${key}`, value);
      this.load();
    }
  }
  const utils = new Utils();
  const setting = new Config();
  utils.log("脚本当前版本:", setting.version);
  utils.log("自动格式化正文:", setting.auto_format);
  utils.log(`自动格式化时 正文字体: "${setting.font_name}"`);
  utils.log(`自动格式化时 正文字体大小: ${setting.font_size} px`);
  utils.log("只格式化一楼:", setting.only_format_lz);
  utils.log("自动屏蔽异地 IP 登录提醒:", setting.block_ip_warning);
  let block_email_timer = setInterval(() => {
    setTimeout(block_email_warning, 0);
  }, 50);
  let counter = 0;
  function block_email_warning() {
    counter += 1;
    if (counter > 50)
      clearInterval(block_email_timer);
    let skip_button_node = document.querySelector(
      "button#fwin_dialog_submit"
    );
    if (skip_button_node) {
      skip_button_node.click();
      clearInterval(block_email_timer);
    }
  }
  const style_node = _GM_addStyle(
    `.tl th a:visited, .tl td.fn a:visited { color: #ccc; }`
  );
  utils.debug(`添加自定义样式 新增 CSS id: style#${style_node.id}`);
  let menu_id_map = {
    click_num: void 0,
    auto_format: void 0,
    format_font_name: void 0,
    format_font_size: void 0,
    switch_ip_warning: void 0,
    go_to_report: void 0,
    reset_config: void 0
  };
  const recreate_menu_command = () => {
    Object.values(menu_id_map).forEach((menu_id) => {
      if (menu_id)
        _GM_unregisterMenuCommand(menu_id);
    });
    menu_id_map.click_num = _GM_registerMenuCommand(
      "👆 点击了 " + _GM_getValue("click_num", 0) + " 次",
      () => {
        _GM_setValue("click_num", _GM_getValue("click_num", 0) + 1);
        recreate_menu_command();
      }
    );
    menu_id_map.auto_format = _GM_registerMenuCommand(
      (setting.auto_format ? "✔️ 已启用" : "❌ 已禁用") + "自动格式化正文",
      () => {
        setting.save("auto_format", setting.auto_format ? "false" : "true");
        utils.log(
          (setting.auto_format ? "✔️ 已启用" : "❌ 已禁用") + "自动格式化正文"
        );
        window.location.reload();
      }
    );
    if (setting.auto_format) {
      menu_id_map.format_font_name = _GM_registerMenuCommand(
        `　├─ 🗚 字体: "${setting.font_name}"`,
        () => {
          const font_name = prompt(
            "请输入自定义字体名称 (需要电脑里已经安装好的字体):",
            setting.font_name
          );
          if (font_name) {
            setting.save("font_name", font_name);
            utils.log(`字体设置为: "${font_name}"`);
            window.location.reload();
          } else {
            utils.debug("用户取消输入");
          }
        }
      );
      menu_id_map.format_font_size = _GM_registerMenuCommand(
        `　└─ 🗚 字体大小: ${setting.font_size} px`,
        () => {
          const font_size = Number(
            prompt(
              "请输入自定义字体大小, 单位为像素(px):",
              String(setting.font_size)
            )
          );
          if (font_size > 0) {
            setting.save("font_size", String(font_size));
            utils.log(`字体大小设置为: ${font_size} px`);
            window.location.reload();
          } else {
            utils.debug("用户取消输入");
          }
        }
      );
    }
    menu_id_map.switch_ip_warning = _GM_registerMenuCommand(
      (setting.block_ip_warning ? "❌ 已禁用" : "✔️ 已启用") + "异地 IP 登录提醒",
      () => {
        setting.save(
          "block_ip_warning",
          setting.block_ip_warning ? "false" : "true"
        );
        utils.log(
          (setting.block_ip_warning ? "❌ 已禁用" : "✔️ 已启用") + "异地 IP 登录提醒"
        );
        recreate_menu_command();
      }
    );
    menu_id_map.go_to_report = _GM_registerMenuCommand(
      "🆕 提出需求 & 反馈 BUG",
      () => {
        _GM_openInTab(
          "https://mcseas.club/forum.php?mod=viewthread&tid=50579",
          false
        );
      }
    );
    menu_id_map.reset_config = _GM_registerMenuCommand("🆑 重置所有配置项", () => {
      _GM_listValues().forEach((key) => {
        _GM_deleteValue(key);
      });
      window.location.reload();
    });
  };
  recreate_menu_command();
  if (setting.block_ip_warning) {
    let block_ip_warning = function() {
      counter2 += 1;
      if (counter2 > 50)
        clearInterval(block_ip_timer);
      let close_button_nodes = document.querySelectorAll("#ip_notice .bm_h a");
      if (close_button_nodes.length === 1) {
        close_button_nodes[0].click();
        clearInterval(block_ip_timer);
      }
    };
    let block_ip_timer = setInterval(() => {
      setTimeout(block_ip_warning, 0);
    }, 50);
    let counter2 = 0;
  }
  const target_pid_str = window.location.href.match(/[&#]pid=?(\d+)/i);
  if (target_pid_str !== null) {
    const target_pid = target_pid_str[1];
    let target_pid_node = document.querySelector(
      `#pid${target_pid}`
    );
    if (target_pid_node) {
      (_a = target_pid_node.querySelector("td.plc")) == null ? void 0 : _a.classList.add("highlight-card");
      const style_node2 = _GM_addStyle(
        `.highlight-card { background-color: #dedbcc; color: #363636; -moz-box-shadow: 0.075rem 0.125rem 0.25rem rgba(0, 0, 0, 0.5); -webkit-box-shadow: 0.075rem 0.125rem 0.25rem rgba(0, 0, 0, 0.5); box-shadow: 0.075rem 0.125rem 0.25rem rgba(0, 0, 0, 0.5); } .highlight-card:hover { -webkit-box-shadow: 0 0.325rem 1.75rem rgba(0, 0, 0, 0.3); -moz-box-shadow: 0 0.325rem 1.75rem rgba(0, 0, 0, 0.3); box-shadow: 0 0.325rem 1.75rem rgba(0, 0, 0, 0.3); }`
      );
      utils.debug(`高亮当前楼层 新增 CSS id: style#${style_node2.id}`);
    }
  }
  (_b = document.querySelector("#append_parent")) == null ? void 0 : _b.classList.add("heti-parent");
  let breadcrumb_nodes = document.querySelectorAll("div#pt > div.z > a");
  if (breadcrumb_nodes.length > 4 && ["原创文学", "审核区"].includes(breadcrumb_nodes[3].innerText)) {
    let post_nodes = document.querySelectorAll("table.plhin td.plc");
    for (let i = 0; i < post_nodes.length; i++) {
      if (setting.only_format_lz && ((_c = post_nodes[i].querySelector("div.pi > strong > a")) == null ? void 0 : _c.innerText.trim()) !== "战列舰")
        break;
      (_d = post_nodes[i].querySelector(".t_f")) == null ? void 0 : _d.classList.add("heti");
    }
  }
  if (setting.auto_format) {
    const style_nodes = [
      // 引入赫蹏 CSS
      _GM_addStyle(_GM_getResourceText("css")),
      // 修改字体
      _GM_addStyle(
        `.heti, .heti-parent .pcb { font-family: "${setting.font_name}", "Helvetica Neue", helvetica, arial, "Heti Hei", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; font-size: ${setting.font_size}px; }`
      )
    ];
    utils.debug(
      "自动格式化正文 新增 CSS id:",
      style_nodes.map((node) => `style#${node.id}`)
    );
    window.onload = () => {
      const heti = new _monkeyWindow.Heti(".heti, .heti-parent .pcb");
      heti.autoSpacing();
    };
  }

})();