"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faceSwap = void 0;
const index_1 = require("./gradio/index");
class faceSwap {
    hf_token;
    constructor(hf_token) {
        this.hf_token = hf_token;
    }
    async changeFace(Target, Source) {
        const app = await (0, index_1.client)("https://felixrosberg-face-swap.hf.space/", {
            hf_token: this.hf_token,
        });
        // console.log("app", app);
        const result = await app.predict(1, [
            Target, // blob in 'Target' Image component
            Source, // blob in 'Source' Image component
            0, // number (numeric value between 0 and 100) in 'Anonymization ratio (%)' Slider component
            0, // number (numeric value between 0 and 100) in 'Adversarial defense ratio (%)' Slider component
            "Compare", // string[] (array of strings) in 'Mode' Checkboxgroup component
        ]);
        // result.data;
        return result.data;
        // console.log(result.data[0]);
    }
}
exports.faceSwap = faceSwap;
//# sourceMappingURL=face.swap.js.map