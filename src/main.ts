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
    ): string => pad_target.toString().padStart(pad_length, pad_string);
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

  // match_reg(text: string, regexp: RegExp): string | null {
  //   const match_result = [...text.matchAll(regexp)];
  //   return match_result.length > 0 ? match_result[0][1] : null;
  // }
}

class Config {
  readonly version: string = `${pkg.version}-alpha`;
  auto_format!: boolean;
  font_name!: string;
  font_size!: number;
  only_format_lz!: boolean;
  block_ip_warning!: boolean;
  display_user_medal!: boolean;
  block_email_warning!: boolean;
  data!: {
    user_blacklist: string[];
    replace_pair_list: { [key: string]: string };
  };

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
    this.display_user_medal = GM_getValue("cfg_display_user_medal") !== "false";
    this.block_email_warning =
      GM_getValue("cfg_block_email_warning") === "true";
    this.data = {
      user_blacklist: JSON.parse(GM_getValue("data_user_blacklist") ?? "[]"),
      replace_pair_list: JSON.parse(
        GM_getValue("data_replace_pair_list") ?? "{}"
      ),
    };
  }

  save(key: string, value: string): void {
    GM_setValue(`cfg_${key}`, value);
    this.load();
  }
}

const utils = new Utils();
const setting = new Config();

type StyleNodes = {
  custom_view_list: HTMLStyleElement | undefined;
  custom_format_font: HTMLStyleElement | undefined;
  custom_highlight_floor: HTMLStyleElement | undefined;
  heti: HTMLStyleElement | undefined;
};
let style_nodes: StyleNodes = {
  custom_view_list: undefined,
  custom_format_font: undefined,
  custom_highlight_floor: undefined,
  heti: undefined,
};

type MenuIdMapKeys =
  | "click_num"
  | "auto_format"
  | "format_font_name"
  | "format_font_size"
  | "switch_ip_warning"
  | "display_user_medal"
  | "go_to_report"
  | "edit_replace_pair"
  | "reset_config";
type MenuIdMap = {
  [key in MenuIdMapKeys]: string;
};
let menu_id_map: MenuIdMap = {
  click_num: "",
  auto_format: "",
  format_font_name: "",
  format_font_size: "",
  switch_ip_warning: "",
  display_user_medal: "",
  go_to_report: "",
  edit_replace_pair: "",
  reset_config: "",
};

/**
 * @function rerender_auto_format
 * @param include_heti
 * @returns void
 * @description 重绘自动格式化
 */
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

/**
 * @function recreate_menu_command
 * @returns void
 * @description 重绘脚本菜单
 */
const recreate_menu_command = () => {
  let menu_key: keyof MenuIdMap;
  for (menu_key in menu_id_map) {
    // utils.debug(`重绘前 Menu["${menu_key}"] = "${menu_id_map[menu_key]}"`);
    if (menu_id_map[menu_key] !== "") {
      GM_unregisterMenuCommand(menu_id_map[menu_key]);
      menu_id_map[menu_key] = "";
    }
  }
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
    },
    "r"
  );
  if (setting.auto_format) {
    menu_id_map.format_font_name = GM_registerMenuCommand(
      `　├─ 🗚 字体: "${setting.font_name}"`,
      () => {
        const font_name: string | null = prompt(
          "请输入自定义字体名称（需要电脑里已经安装好的字体）：",
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
      },
      "f"
    );
    menu_id_map.format_font_size = GM_registerMenuCommand(
      `　└─ 🗚 字体大小: ${setting.font_size} px`,
      () => {
        const font_size: number = Number(
          prompt(
            "请输入自定义字体大小，单位为像素(px)：",
            String(setting.font_size)
          )
        );
        if (font_size > 0) {
          setting.save("font_size", String(font_size));
          utils.log(`字体大小设置为：${font_size} px`);
          rerender_auto_format(false);
          recreate_menu_command();
        } else {
          utils.debug("用户取消输入");
        }
      },
      "s"
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
  menu_id_map.display_user_medal = GM_registerMenuCommand(
    (setting.display_user_medal ? "✔️ 显示" : "❌ 隐藏") + "所有用户勋章",
    () => {
      setting.save(
        "display_user_medal",
        setting.display_user_medal ? "false" : "true"
      );
      utils.log(
        (setting.display_user_medal ? "✔️ 已显示" : "❌ 已隐藏") +
          "所有用户勋章"
      );
      window.location.reload();
    }
  );
  menu_id_map.edit_replace_pair = GM_registerMenuCommand(
    "🎭 设置自动替换关键词",
    () => {
      const current_replace_pair_str: string = Object.entries(
        setting.data.replace_pair_list
      )
        .map(([key, value]) => `${key}-${value}`)
        .join(", ");
      const replace_pair_str: string | null = prompt(
        "请输入自动替换的关键词组：\n（格式为 `被替换词-替换词`，多个词组用英文逗号 `,` 分开）" +
          "\n\n注意：只推荐替换中文全角字符，如果替换常见英文字符极有可能会导致乱码。若出现乱码请重新在此处设置以调试效果。",
        current_replace_pair_str || "“-「, ”-」, ‘-『, ’-』"
      );
      if (replace_pair_str !== null) {
        setting.data.replace_pair_list = {};
        GM_setValue(`data_replace_pair_list`, "{}");
        if (replace_pair_str === "") {
          utils.debug("自动替换词组已清空");
          alert("自动替换词组已清空。");
        } else {
          for (const pair_str of replace_pair_str
            .split(",")
            .map((pair) => pair.trim())) {
            const [pattern, replacement]: string[] = pair_str
              .split("-")
              .map((keyword) => keyword.trim());
            setting.data.replace_pair_list[pattern] = replacement;
          }
          GM_setValue(
            `data_replace_pair_list`,
            JSON.stringify(setting.data.replace_pair_list)
          );
          utils.debug("新的自动替换词组:", setting.data.replace_pair_list);
          alert("自动替换词组更新完成。");
        }
        window.location.reload();
      } else {
        utils.debug("用户取消输入");
      }
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
    const confirm_result = confirm(`确认清空保存的所有配置项？`);
    if (confirm_result == true) {
      for (const key of GM_listValues()) {
        GM_deleteValue(key);
      }
      alert("所有配置项均已清空。");
      window.location.reload();
    }
  });
};

/**
 * @function block_user
 * @param user_name
 * @returns void
 * @description 屏蔽指定用户名
 */
// @ts-ignore: 导出屏蔽用户功能
window.block_user = (user_name: string) => {
  const confirm_result = confirm(
    `确认屏蔽 ${user_name} 发布的主题？\n（屏蔽数据仅保存在本地，可以通过重置插件设置来取消屏蔽）`
  );
  if (confirm_result == true) {
    setting.data.user_blacklist.push(user_name);
    GM_setValue(
      `data_user_blacklist`,
      JSON.stringify([...new Set(setting.data.user_blacklist)])
    );
    // window.history.back();
    alert(`从今开始屏蔽用户 ${user_name} 发布的主题。`);
  }
};

/* 全站生效 */

// utils.debug("lawful-mcseas 脚本开发中...");
utils.debug("GM_listValues()", GM_listValues());
// console.log({ unsafeWindow, monkeyWindow });
utils.log("脚本当前版本:", setting.version);
utils.log("自动格式化正文:", setting.auto_format);
utils.log(`自动格式化时 正文字体: "${setting.font_name}"`);
utils.log(`自动格式化时 正文字体大小: ${setting.font_size} px`);
utils.log("只格式化一楼:", setting.only_format_lz);
utils.log("自动屏蔽异地 IP 登录提醒:", setting.block_ip_warning);
utils.log("屏蔽黑名单:", setting.data.user_blacklist);
utils.log("关键词替换:", setting.data.replace_pair_list);
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

let view_mode: string =
  new URL(window.location.href).searchParams.get("mod") ?? "";
switch (view_mode) {
  /* 浏览论坛模式 */
  case "forumdisplay":
    // 屏蔽黑名单用户发布的主题
    let thread_nodes: NodeListOf<HTMLElement> = document.querySelectorAll(
      "#threadlisttableid tbody"
    );
    thread_nodes.forEach((thread_node) => {
      if (thread_node.id.startsWith("normalthread_")) {
        const thread_title_node: HTMLLinkElement | null =
          thread_node.querySelector(".cony_listzt_top a.cony_listzt_topbt");
        const thread_id: number = Number(
          new URL(thread_title_node?.href ?? "").searchParams.get("tid")
        );
        const thread_title: string = thread_title_node?.innerText ?? "";
        const thread_author_node: HTMLLinkElement | null =
          thread_node.querySelector(".cony_listzt_bottom .z a");
        const uid: number = Number(
          new URL(thread_title_node?.href ?? "").searchParams.get("uid")
        );
        const author_name: string = thread_author_node?.innerText ?? "";
        if (author_name && setting.data.user_blacklist.includes(author_name)) {
          thread_node.remove();
          utils.debug(
            `已屏蔽黑名单用户 "${author_name}"(uid:${uid}) 的主题 "${thread_title}"(tid:${thread_id})`
          );
        }
      }
    });

    // 添加自定义样式 CSS
    style_nodes.custom_view_list = GM_addStyle(
      `.tl th a:visited, .tl td.fn a:visited { color: #ccc; }`
    );
    utils.debug(
      `添加自定义样式 新增 CSS id: style#${style_nodes.custom_view_list?.id}`
    );
    break;

  /* 浏览帖子详情模式 */
  case "viewthread":
    // 隐藏勋章
    if (!setting.display_user_medal) {
      let medal_nodes: NodeListOf<HTMLElement> =
        document.querySelectorAll(".md_ctrl");
      medal_nodes.forEach((node) => {
        node.remove();
      });
    }

    // 添加屏蔽按钮
    let follow_node: HTMLElement | null = document.querySelector("#follow_li");
    if (follow_node) {
      follow_node.style.width = "65px";
      if (follow_node.parentNode) {
        let list_item_node = document.createElement("li");
        list_item_node.setAttribute("class", "pm2");
        list_item_node.setAttribute(
          "style",
          "background-image: url('static/image/common/locked.gif');"
        );
        let block_user_button_node = document.createElement("a");
        block_user_button_node.setAttribute("href", "javascript:;");
        block_user_button_node.setAttribute("title", "屏蔽TA");
        block_user_button_node.setAttribute("class", "xi2");
        block_user_button_node.setAttribute(
          "onclick",
          `block_user("${
            follow_node.parentNode?.parentNode?.querySelector<HTMLElement>(
              ".authi a"
            )?.innerText
          }")`
        );
        block_user_button_node.innerHTML = "屏蔽TA";
        list_item_node.append(block_user_button_node);
        follow_node.parentNode.append(list_item_node);
      }
    }

    // 高亮显示当前地址跳转楼层
    const highlight_floor_pid: string = new URL(window.location.href).hash;
    if (highlight_floor_pid.startsWith("#pid")) {
      let highlight_floor_node: HTMLElement | null =
        document.querySelector(highlight_floor_pid);
      if (highlight_floor_node) {
        highlight_floor_node
          .querySelector("td.plc")
          ?.classList.add("highlight-card");
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
    if (
      breadcrumb_nodes.length > 4 &&
      ["原创文学", "审核区", "小说"].includes(breadcrumb_nodes[3].innerText)
    ) {
      let post_nodes: NodeListOf<HTMLElement> =
        document.querySelectorAll("table.plhin td.plc");
      for (let i: number = 0, len: number = post_nodes.length; i < len; i++) {
        if (
          setting.only_format_lz &&
          post_nodes[i]
            .querySelector<HTMLElement>("div.pi > strong > a")
            ?.innerText.trim() !== "战列舰"
        )
          break; // 是否只对帖子一楼生效
        let post_node: HTMLElement | null = post_nodes[i].querySelector(".t_f");
        if (post_node) {
          // 将赫蹏 class 引入帖子正文
          post_node.classList.add("heti");
          // 自动替换关键词
          for (let [pattern, replacement] of Object.entries(
            setting.data.replace_pair_list
          )) {
            post_node.innerHTML = post_node.innerHTML.replaceAll(
              pattern,
              replacement
            );
          }
        }
      }
    }
    rerender_auto_format();
    break;

  /* 仅对首页生效 */
  default:
    // 自动关闭邮箱未验证提示框
    let block_email_timer: number = setInterval(() => {
      setTimeout(block_email_warning, 0);
    }, 50);
    let counter: number = 0;
    function block_email_warning() {
      counter += 1;
      if (counter > 50) clearInterval(block_email_timer);

      // let email_warning_node: HTMLElement | null =
      //   document.querySelector("#fwin_dialog");
      // if (email_warning_node) {
      //   let email_warning_title_node: NodeListOf<HTMLElement> =
      //     email_warning_node.querySelectorAll(".alert_error p");
      //   if (
      //     email_warning_title_node.length > 0 &&
      //     email_warning_title_node[0].innerText.startsWith("您的注册邮箱为")
      //   ) {
      //     let append_parent_node: HTMLElement | null =
      //       document.querySelector("#append_parent");
      //     if (append_parent_node) append_parent_node.innerHTML = "";
      //     clearInterval(block_email_timer);
      //   }
      // }

      let skip_button_node: HTMLElement | null = document.querySelector(
        "button#fwin_dialog_submit"
      );
      if (skip_button_node) {
        skip_button_node.click();
        clearInterval(block_email_timer);
      }
    }
}

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
