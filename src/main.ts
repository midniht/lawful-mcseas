/**
 * @name 秩序心海
 * @description 文档 https://www.tampermonkey.net/documentation.php
 */

import {
  GM_log,
  GM_getResourceText,
  GM_addStyle,
  GM_setValue,
  GM_getValue,
  GM_listValues,
  GM_deleteValue,
  GM_registerMenuCommand,
  GM_unregisterMenuCommand,
  GM_openInTab,
  monkeyWindow,
} from "$";
import pkg from "../package.json";

class Utils {
  current(): string {
    const t = new Date();
    const pad = (
      pad_target: any,
      pad_length: number = 2,
      pad_string: string = "0"
    ): string => {
      return pad_target.toString().padStart(pad_length, pad_string);
    };
    return (
      [pad(t.getFullYear(), 4), pad(t.getMonth()), pad(t.getDate())].join("-") +
      " " +
      [pad(t.getHours()), pad(t.getMinutes()), pad(t.getSeconds())].join(":")
    );
  }

  debug(...args: any[]): void {
    GM_log(`${this.current()} | DEBUG |`, ...args);
  }

  log(...args: any[]): void {
    console.log(`${this.current()} [秩序心海]`, ...args);
  }
}

class Config {
  readonly version: string = `${pkg.version}-alpha`;
  auto_format!: boolean;
  font_name!: string;
  font_size!: number;
  only_format_lz!: boolean;
  block_ip_warning!: boolean;
  block_email_warning!: boolean;

  constructor() {
    this.load();
  }

  load(): void {
    this.auto_format = GM_getValue("cfg_auto_format") !== "false";
    this.font_name = GM_getValue("cfg_font_name") || "小赖字体 等宽 SC";
    // "LXGW Bright", "LXGW Wenkai Mono", "霞鹜新晰黑", "悠哉字体", "小赖字体 等宽 SC", "Ark Pixel 12px Proportional zh_cn"
    this.font_size = Number(GM_getValue("cfg_font_size"));
    this.font_size = this.font_size > 0 ? this.font_size : 16;
    this.only_format_lz = GM_getValue("cfg_only_format_lz") !== "false";
    this.block_ip_warning = GM_getValue("cfg_block_ip_warning") === "true";
    this.block_email_warning =
      GM_getValue("cfg_block_email_warning") === "true";
  }

  save(key: string, value: string): void {
    GM_setValue(`cfg_${key}`, value);
    this.load();
  }
}

const utils = new Utils();
const setting = new Config();

// utils.debug("lawful-mcseas 脚本开发中...");
// utils.debug("GM_listValues()", GM_listValues());
// console.log({ unsafeWindow, monkeyWindow });

utils.log("脚本当前版本:", setting.version);
utils.log("自动格式化正文:", setting.auto_format);
utils.log(`自动格式化时 正文字体: "${setting.font_name}"`);
utils.log(`自动格式化时 正文字体大小: ${setting.font_size} px`);
utils.log("只格式化一楼:", setting.only_format_lz);
utils.log("自动屏蔽异地 IP 登录提醒:", setting.block_ip_warning);

// 自动关闭邮箱未验证提示框
let block_email_timer: number = setInterval(() => {
  setTimeout(block_email_warning, 0);
}, 50);
let counter: number = 0;
function block_email_warning() {
  counter += 1;
  if (counter > 50) clearInterval(block_email_timer);
  //   let email_warning_node = document.querySelector("#fwin_dialog");
  //   if (email_warning_node) {
  //     let email_warning_title_node =
  //       email_warning_node.querySelectorAll(".alert_error p");
  //     if (
  //       email_warning_title_node.length > 0 &&
  //       email_warning_title_node[0].innerText.startsWith("您的注册邮箱为")
  //     ) {
  //       document.querySelector("#append_parent").innerHTML = "";
  //       clearInterval(block_email_timer);
  //     }
  //   }
  let skip_button_node: HTMLElement | null = document.querySelector(
    "button#fwin_dialog_submit"
  );
  if (skip_button_node) {
    skip_button_node.click();
    clearInterval(block_email_timer);
  }
}

// 添加自定义样式 CSS
type StyleNodes = {
  custom: HTMLStyleElement | undefined;
  custom_format_font: HTMLStyleElement | undefined;
  custom_highlight_floor: HTMLStyleElement | undefined;
  heti: HTMLStyleElement | undefined;
};
let style_nodes: StyleNodes = {
  custom: GM_addStyle(`.tl th a:visited, .tl td.fn a:visited { color: #ccc; }`),
  custom_format_font: undefined,
  custom_highlight_floor: undefined,
  heti: undefined,
};
utils.debug(`添加自定义样式 新增 CSS id: style#${style_nodes.custom?.id}`);

// 注册脚本菜单
type MenuIdMap = {
  click_num: string | undefined;
  auto_format: string | undefined;
  format_font_name: string | undefined;
  format_font_size: string | undefined;
  switch_ip_warning: string | undefined;
  go_to_report: string | undefined;
  reset_config: string | undefined;
};
let menu_id_map: MenuIdMap = {
  click_num: undefined,
  auto_format: undefined,
  format_font_name: undefined,
  format_font_size: undefined,
  switch_ip_warning: undefined,
  go_to_report: undefined,
  reset_config: undefined,
};
const recreate_menu_command = () => {
  Object.values(menu_id_map).forEach((menu_id) => {
    if (menu_id) GM_unregisterMenuCommand(menu_id);
  });
  menu_id_map.click_num = GM_registerMenuCommand(
    "👆 点击了 " + GM_getValue("click_num", 0) + " 次",
    () => {
      GM_setValue("click_num", GM_getValue("click_num", 0) + 1);
      recreate_menu_command();
    }
  );
  menu_id_map.auto_format = GM_registerMenuCommand(
    (setting.auto_format ? "✔️ 已启用" : "❌ 已禁用") + "自动格式化正文",
    () => {
      setting.save("auto_format", setting.auto_format ? "false" : "true");
      utils.log(
        (setting.auto_format ? "✔️ 已启用" : "❌ 已禁用") + "自动格式化正文"
      );
      rerender_auto_format();
      recreate_menu_command();
    }
  );
  if (setting.auto_format) {
    menu_id_map.format_font_name = GM_registerMenuCommand(
      `　├─ 🗚 字体: "${setting.font_name}"`,
      () => {
        const font_name: string | null = prompt(
          "请输入自定义字体名称 (需要电脑里已经安装好的字体):",
          setting.font_name
        );
        if (font_name) {
          setting.save("font_name", font_name);
          utils.log(`字体设置为: "${font_name}"`);
          rerender_auto_format(false);
          recreate_menu_command();
        } else {
          utils.debug("用户取消输入");
        }
      }
    );
    menu_id_map.format_font_size = GM_registerMenuCommand(
      `　└─ 🗚 字体大小: ${setting.font_size} px`,
      () => {
        const font_size: number = Number(
          prompt(
            "请输入自定义字体大小, 单位为像素(px):",
            String(setting.font_size)
          )
        );
        if (font_size > 0) {
          setting.save("font_size", String(font_size));
          utils.log(`字体大小设置为: ${font_size} px`);
          rerender_auto_format(false);
          recreate_menu_command();
        } else {
          utils.debug("用户取消输入");
        }
      }
    );
  }
  menu_id_map.switch_ip_warning = GM_registerMenuCommand(
    (setting.block_ip_warning ? "❌ 已禁用" : "✔️ 已启用") + "异地 IP 登录提醒",
    () => {
      setting.save(
        "block_ip_warning",
        setting.block_ip_warning ? "false" : "true"
      );
      utils.log(
        (setting.block_ip_warning ? "❌ 已禁用" : "✔️ 已启用") +
          "异地 IP 登录提醒"
      );
      recreate_menu_command();
    }
  );
  menu_id_map.go_to_report = GM_registerMenuCommand(
    "🆕 提出需求 & 反馈 BUG",
    () => {
      // 参数 openInBackground: false 自动跳转到打开的标签页
      GM_openInTab(
        "https://mcseas.club/forum.php?mod=viewthread&tid=50579",
        false
      );
    }
  );
  menu_id_map.reset_config = GM_registerMenuCommand("🆑 重置所有配置项", () => {
    GM_listValues().forEach((key: string) => {
      GM_deleteValue(key);
    });
    window.location.reload();
  });
};
recreate_menu_command();

// 自动关闭异地 IP 登录提醒
if (setting.block_ip_warning) {
  let block_ip_timer: number = setInterval(() => {
    setTimeout(block_ip_warning, 0);
  }, 50);
  let counter: number = 0;
  function block_ip_warning() {
    counter += 1;
    if (counter > 50) clearInterval(block_ip_timer);
    // let ip_notice_node = document.querySelector<HTMLElement>("#ip_notice");
    // if (ip_notice_node) {
    //   ip_notice_node.style.display = "none";
    // }
    // GM_cookie.delete({ name: "lip" }, function (error: any) {
    //   if (error) {
    //     utils.debug(error); // not supported
    //   } else {
    //     utils.log("Cookie deleted successfully");
    //   }
    // });
    // clearInterval(block_ip_timer);
    let close_button_nodes: NodeListOf<HTMLElement> =
      document.querySelectorAll("#ip_notice .bm_h a");
    if (close_button_nodes.length === 1) {
      close_button_nodes[0].click();
      clearInterval(block_ip_timer);
    }
  }
}

// 高亮显示当前地址跳转楼层
const target_pid_str = window.location.href.match(/[&#]pid=?(\d+)/i);
if (target_pid_str !== null) {
  const target_pid = target_pid_str[1];
  let target_pid_node: Element | null = document.querySelector(
    `#pid${target_pid}`
  );
  if (target_pid_node) {
    target_pid_node.querySelector("td.plc")?.classList.add("highlight-card");
    style_nodes.custom_highlight_floor = GM_addStyle(
      `.highlight-card { background-color: #dedbcc; color: #363636; -moz-box-shadow: 0.075rem 0.125rem 0.25rem rgba(0, 0, 0, 0.5); -webkit-box-shadow: 0.075rem 0.125rem 0.25rem rgba(0, 0, 0, 0.5); box-shadow: 0.075rem 0.125rem 0.25rem rgba(0, 0, 0, 0.5); } .highlight-card:hover { -webkit-box-shadow: 0 0.325rem 1.75rem rgba(0, 0, 0, 0.3); -moz-box-shadow: 0 0.325rem 1.75rem rgba(0, 0, 0, 0.3); box-shadow: 0 0.325rem 1.75rem rgba(0, 0, 0, 0.3); }`
    );
    utils.debug(
      `高亮当前楼层 新增 CSS id: style#${style_nodes.custom_highlight_floor.id}`
    );
  }
}

// 自动格式化正文
document.querySelector("#append_parent")?.classList.add("heti-parent"); // 将赫蹏 class 引入阅读模式
let breadcrumb_nodes: NodeListOf<HTMLElement> =
  document.querySelectorAll("div#pt > div.z > a");
// 只对原创区帖子生效
if (
  breadcrumb_nodes.length > 4 &&
  ["原创文学", "审核区"].includes(breadcrumb_nodes[3].innerText)
) {
  let post_nodes: NodeListOf<Element> =
    document.querySelectorAll("table.plhin td.plc");
  for (let i: number = 0; i < post_nodes.length; i++) {
    if (
      setting.only_format_lz &&
      post_nodes[i]
        .querySelector<HTMLElement>("div.pi > strong > a")
        ?.innerText.trim() !== "战列舰"
    )
      break; // 是否只对帖子一楼生效
    post_nodes[i].querySelector(".t_f")?.classList.add("heti"); // 将赫蹏 class 引入帖子正文
  }
}
const rerender_auto_format = (include_heti: boolean = true) => {
  if (setting.auto_format) {
    if (include_heti) {
      // 引入赫蹏 CSS
      style_nodes.heti?.remove();
      style_nodes.heti = GM_addStyle(GM_getResourceText("css"));
      utils.debug(
        `自动格式化正文 赫蹏 更新 CSS id: style#${style_nodes.heti.id}`
      );
      window.onload = () => {
        // @ts-ignore: 使用挂载到 monkeyWindow 的 Heti
        const heti = new monkeyWindow.Heti(".heti, .heti-parent .pcb");
        heti.autoSpacing(); // 赫蹏自动进行中西文混排美化和标点挤压
      };
    }
    // 修改字体
    style_nodes.custom_format_font?.remove();
    style_nodes.custom_format_font = GM_addStyle(
      `.heti, .heti-parent .pcb { font-family: "${setting.font_name}", "Helvetica Neue", helvetica, arial, "Heti Hei", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; font-size: ${setting.font_size}px; }`
    );
    // Object.entries(style_nodes).map((item) => `${item[0]}: style#${item[1]?.id}`)
    utils.debug(
      `自动格式化正文 自定义字体 更新 CSS id: style#${style_nodes.custom_format_font.id}`
    );
  } else {
    style_nodes.heti?.remove();
    style_nodes.custom_format_font?.remove();
  }
};
rerender_auto_format();

/*
GM_notification({
  image: "https://i.postimg.cc/7YKQTtNz/mcsea.jpg",
  title: "秩序心海",
  text: "通知内容",
  highlight: true, // 是否突出显示发送通知的选项卡
  silent: false, // 是否播放声音
  timeout: 10000, // 通知隐藏时间
  onclick: function () {
    GM_setClipboard("text");
  },
  ondone() {}, // 在通知关闭（无论这是由超时还是单击触发）或突出显示选项卡时调用
});
*/
