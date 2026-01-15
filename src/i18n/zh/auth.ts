import enUS from "../en-US/auth";

// Chinese - use en-US as base, all keys available
export default {
  ...enUS,
  changeLanguage: "\u66f4\u6539\u8bed\u8a00",
  saveChanges: "\u4fdd\u5b58\u66f4\u6539",
  cancel: "\u53d6\u6d88",
  languageSaved: "\u8bed\u8a00\u5df2\u6210\u529f\u4fdd\u5b58",
  accountSettings: "\u8d26\u6237\u8bbe\u7f6e",
  appSettings: "\u5e94\u7528\u8bbe\u7f6e",
  language: "\u8bed\u8a00",
  nickname: "\u6635\u79f0",
  nameShown: "\u663e\u793a\u7684\u540d\u79f0",
  realName: "\u771f\u5b9e\u59d3\u540d",
  changePassword: "\u66f4\u6539\u5bc6\u7801",
  changeEmailAddress: "\u66f4\u6539\u90ae\u4ef6\u5730\u5740",
  changeBio: "\u66f4\u6539\u7b80\u4ecb",
  changeLocation: "\u66f4\u6539\u4f4d\u7f6e",
  privacySettings: "\u9690\u79c1\u8bbe\u7f6e",
  helpAndSupport: "\u5e2e\u52a9\u4e0e\u652f\u6301",
  faq: "\u5e38\u89c1\u95ee\u9898",
  aboutApp: "\u5173\u4e8e\u5e94\u7528",
  banList: "\u5c01\u7981\u5217\u8868",
  comingSoon: "\u5373\u5c06\u63a8\u51fa",
  notifications: "\u901a\u77e5",
  sources: "\u6765\u6e90",
  screenMode: "\u5c4f\u5e55\u6a21\u5f0f",
  appearance: "\u5916\u89c2",
  privacy: "\u9690\u79c1",
  logOut: "\u9000\u51fa\u767b\u5f55",
  languages: {
    ...enUS.languages,
    // Override with Chinese translations for all languages
    "en-US": { name: "\u82f1\u8bed (\u7f8e\u56fd)" }, // 英语 (美国)
    "en-GB": { name: "\u82f1\u8bed (\u82f1\u56fd)" }, // 英语 (英国)
    sk: { name: "\u65af\u6d1b\u4f10\u514b\u8bed" }, // 斯洛伐克语
    cs: { name: "\u6377\u514b\u8bed" }, // 捷克语
    de: { name: "\u5fb7\u8bed" }, // 德语
    fr: { name: "\u6cd5\u8bed" }, // 法语
    es: { name: "\u897f\u73ed\u7259\u8bed" }, // 西班牙语
    it: { name: "\u610f\u5927\u5229\u8bed" }, // 意大利语
    pl: { name: "\u6ce2\u5170\u8bed" }, // 波兰语
    hu: { name: "\u5308\u7259\u5229\u8bed" }, // 匈牙利语
    ro: { name: "\u7f57\u9a6c\u5c3c\u4e9a\u8bed" }, // 罗马尼亚语
    ru: { name: "\u4fc4\u8bed" }, // 俄语
    uk: { name: "\u4e4c\u514b\u5170\u8bed" }, // 乌克兰语
    zh: { name: "\u4e2d\u6587" }, // 中文
    hi: { name: "\u5370\u5730\u8bed" }, // 印地语
    ar: { name: "\u963f\u62c9\u4f2f\u8bed" }, // 阿拉伯语
    ja: { name: "\u65e5\u8bed" }, // 日语
    ko: { name: "\u97e9\u8bed" }, // 韩语
    sq: { name: "\u963f\u5c14\u5df4\u5c3c\u4e9a\u8bed" }, // 阿尔巴尼亚语
    hy: { name: "\u4e9a\u7f8e\u5c3c\u4e9a\u8bed" }, // 亚美尼亚语
    az: { name: "\u963f\u585e\u62dc\u7586\u8bed" }, // 阿塞拜疆语
    bn: { name: "\u5b5f\u52a0\u62c9\u8bed" }, // 孟加拉语
    bg: { name: "\u4fdd\u52a0\u5229\u4e9a\u8bed" }, // 保加利亚语
    hr: { name: "\u514b\u7f57\u5730\u4e9a\u8bed" }, // 克罗地亚语
    da: { name: "\u4e39\u9ea6\u8bed" }, // 丹麦语
    et: { name: "\u7231\u6c99\u5c3c\u4e9a\u8bed" }, // 爱沙尼亚语
    fi: { name: "\u82ac\u5170\u8bed" }, // 芬兰语
    ka: { name: "\u683c\u9c81\u5409\u4e9a\u8bed" }, // 格鲁吉亚语
    el: { name: "\u5e0c\u814a\u8bed" }, // 希腊语
    he: { name: "\u5e0c\u4f2f\u6765\u8bed" }, // 希伯来语
    id: { name: "\u5370\u5ea6\u5c3c\u897f\u4e9a\u8bed" }, // 印度尼西亚语
    kk: { name: "\u54c8\u8428\u514b\u8bed" }, // 哈萨克语
    lo: { name: "\u8001\u62c9\u8bed" }, // 老挝语
    lv: { name: "\u62c9\u8131\u7ef4\u4e9a\u8bed" }, // 拉脱维亚语
    lt: { name: "\u7acb\u9676\u5c9b\u8bed" }, // 立陶宛语
    mk: { name: "\u9a6c\u5176\u987f\u8bed" }, // 马其顿语
    ne: { name: "\u5c3c\u6cca\u5c14\u8bed" }, // 尼泊尔语
    no: { name: "\u632a\u5a01\u8bed" }, // 挪威语
    fa: { name: "\u6ce2\u65af\u8bed" }, // 波斯语
    pt: { name: "\u8461\u8404\u7259\u8bed" }, // 葡萄牙语
    sr: { name: "\u585e\u5c14\u7ef4\u4e9a\u8bed" }, // 塞尔维亚语
    sv: { name: "\u745e\u5178\u8bed" }, // 瑞典语
    th: { name: "\u6cf0\u8bed" }, // 泰语
    tr: { name: "\u571f\u8033\u5176\u8bed" }, // 土耳其语
    ur: { name: "\u4e4c\u5c14\u90fd\u8bed" }, // 乌尔都语
    nl: { name: "\u8377\u5170\u8bed" }, // 荷兰语
    // New languages - exonyma (Chinese names)
    "pa-PK": { name: "\u65af\u57fa\u5c14\u8bed", nativeName: "\u067e\u0646\u062c\u0627\u0628\u06cc" },
    "mr-IN": { name: "\u9a6c\u62c9\u4f53\u8bed (\u5370\u5ea6)", nativeName: "\u092e\u0930\u093e\u0920\u0940" },
    "te-IN": { name: "\u6cf0\u5362\u56fa\u8bed (\u5370\u5ea6)", nativeName: "\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41" },
    "ta-IN": { name: "\u6cf0\u7c73\u5c14\u8bed (\u5370\u5ea6)", nativeName: "\u0ba4\u0bae\u0bbf\u0bb4\u0bcd" },
    "vi-VN": { name: "\u8d8a\u5357\u8bed", nativeName: "Ti\u1ebfng Vi\u1ec7t" },
    "fil-PH": { name: "\u83f2\u5f8b\u5bbe\u8bed", nativeName: "Filipino" },
    "sw-TZ": { name: "\u65af\u74e6\u5e0c\u91cc\u8bed", nativeName: "Kiswahili" },
    "ha-NE": { name: "\u8c6a\u8428\u8bed", nativeName: "Hausa" },
    "yue-HK": { name: "\u7ca4\u8bed (\u9999\u6e2f)", nativeName: "\u7cb5\u8a9e" },
    "wuu-CN": { name: "\u5434\u8bed", nativeName: "\u5434\u8bed" },
    "jv-ID": { name: "\u722a\u54c7\u8bed", nativeName: "Basa Jawa" },
    "gu-IN": { name: "\u53e4\u5409\u62c9\u7279\u8bed (\u5370\u5ea6)", nativeName: "\u0a97\u0ac1\u0a9c\u0ab0\u0abe\u0aa4\u0ac0" },
    "kn-IN": { name: "\u5361\u7eb3\u8fbe\u8bed (\u5370\u5ea6)", nativeName: "\u0c95\u0ca8\u0ccd\u0ca8\u0ca1" }
  }
};
