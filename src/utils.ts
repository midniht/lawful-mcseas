import { GM_log, GM_setValue, GM_getValue } from "$";
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
      [pad(t.getFullYear(), 4), pad(t.getMonth() + 1), pad(t.getDate())].join(
        "-"
      ) +
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
  auto_format_with_segment!: boolean;
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
    this.auto_format_with_segment =
      GM_getValue("cfg_auto_format_with_segment") !== "false";
    this.font_name = GM_getValue("cfg_font_name") || "小赖字体 等宽 SC";
    // "LXGW Bright", "LXGW Wenkai Mono", "悠哉字体", "小赖字体 等宽 SC"
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

type MenuIdMapKeys =
  | "auto_format"
  | "auto_format_with_segment"
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
  auto_format: "",
  auto_format_with_segment: "",
  format_font_name: "",
  format_font_size: "",
  switch_ip_warning: "",
  display_user_medal: "",
  go_to_report: "",
  edit_replace_pair: "",
  reset_config: "",
};

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

export { Utils, Config, menu_id_map, style_nodes };
