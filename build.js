const path = require("path");
const AdmZip = require("adm-zip");
const fs = require("fs");
const crypto = require("crypto");
const { version } = require("./package.json");

const MAIN_JS_PATH = path.resolve(__dirname, "./dist/main.js");
const PLUGIN_NAME = `bob-plugin-vocabulary.com@${version}.bobplugin`;
const ARTIFACT_PATH = path.resolve(__dirname, `./release/${PLUGIN_NAME}`);

const INFO_JSON = {
    identifier: "com.lingjing.vocabulary.translate",
    version: version,
    category: "translate",
    name: "Vocabulary Enhanced",
    author: "Oops418; LingJingMaster",
    summary: "A powerful English-English dictionary using vocabulary.com",
    homepage: "https://github.com/LingJingMaster/bob-plugin-vocabulary.com",
    minBobVersion: "1.8.0",
    options:[{
        identifier: "ttsType",
        type: "menu",
        title: "选择发音来源",
        defaultValue: "google",
        menuValues: [{
            title: "google",
            value: "google"
        },{
            title: "有道",
            value: "youDao"
        }],
        desc: "可选的发音来源，默认为google"
    }, {
        identifier: "showMore",
        type: "menu",
        title: "显示补充解释（More）",
        defaultValue: "yes",
        menuValues: [{ title: "显示", value: "yes" }, { title: "隐藏", value: "no" }]
    }, {
        identifier: "showExamples",
        type: "menu",
        title: "显示例句",
        defaultValue: "yes",
        menuValues: [{ title: "显示", value: "yes" }, { title: "隐藏", value: "no" }]
    }],

};

const initAppcast = () => {
    const fileBuffer = fs.readFileSync(ARTIFACT_PATH);
    const sha = crypto.createHash("sha256");
    sha.update(fileBuffer);
    const hex = sha.digest("hex");
    const currentVersionInfo = {
        version: version,
        desc: `见 https://github.com/LingJingMaster/bob-plugin-vocabulary.com/releases`,
        sha256: hex,
        url: `https://github.com/LingJingMaster/bob-plugin-vocabulary.com/releases/download/v${version}/bob-plugin-vocabulary.com@${version}.bobplugin`,
        minBobVersion: INFO_JSON.minBobVersion,
        timestamp: Date.now()
    };
    let appcastPath = path.resolve(__dirname, "./appcast.json");
    const appcast = fs.existsSync(appcastPath) ? JSON.parse(fs.readFileSync(appcastPath, "utf-8")) : { identifier: INFO_JSON.identifier, versions: [] };
    appcast.identifier = INFO_JSON.identifier;
    if (!appcast.versions.find((item) => item.version === currentVersionInfo.version)) {
        appcast.versions.unshift(currentVersionInfo);
        fs.writeFileSync(appcastPath, JSON.stringify(appcast, null, 2), { encoding: "utf-8" });
    }
};

const isRelease = process.argv.includes("--release");
const createZip = () => {
    const zip = new AdmZip();
    zip.addLocalFile(MAIN_JS_PATH);
    ["icon.png"].forEach((file) => {
        zip.addLocalFile(`./static/${file}`);
    });
    zip.addFile("info.json", JSON.stringify(INFO_JSON));
    fs.mkdirSync(path.dirname(ARTIFACT_PATH), { recursive: true });
    zip.writeZip(ARTIFACT_PATH);
    console.log(new Date(), "Zip created");
    isRelease && initAppcast();
};

require("esbuild")
    .build({
        entryPoints: ["./src/entry.ts"],
        bundle: true,
        platform: "node",
        treeShaking: false,
        outfile: MAIN_JS_PATH
    })
    .then(() => {
        createZip();
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
