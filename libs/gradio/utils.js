"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hardware_types = exports.RE_SPACE_DOMAIN = exports.RE_SPACE_NAME = void 0;
exports.determine_protocol = determine_protocol;
exports.process_endpoint = process_endpoint;
exports.map_names_to_ids = map_names_to_ids;
exports.discussions_enabled = discussions_enabled;
exports.get_space_hardware = get_space_hardware;
exports.set_space_hardware = set_space_hardware;
exports.set_space_timeout = set_space_timeout;
function determine_protocol(endpoint) {
    if (endpoint.startsWith("http")) {
        const { protocol, host } = new URL(endpoint);
        if (host.endsWith("hf.space")) {
            return {
                ws_protocol: "wss",
                host: host,
                http_protocol: protocol,
            };
        }
        else {
            return {
                ws_protocol: protocol === "https:" ? "wss" : "ws",
                http_protocol: protocol,
                host,
            };
        }
    }
    // default to secure if no protocol is provided
    return {
        ws_protocol: "wss",
        http_protocol: "https:",
        host: endpoint,
    };
}
exports.RE_SPACE_NAME = /^[^\/]*\/[^\/]*$/;
exports.RE_SPACE_DOMAIN = /.*hf\.space\/{0,1}$/;
async function process_endpoint(app_reference, token) {
    const headers = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    const _app_reference = app_reference.trim();
    if (exports.RE_SPACE_NAME.test(_app_reference)) {
        try {
            const res = await fetch(`https://huggingface.co/api/spaces/${_app_reference}/host`, { headers });
            if (res.status !== 200)
                throw new Error("Space metadata could not be loaded.");
            const _host = (await res.json()).host;
            return {
                space_id: app_reference,
                ...determine_protocol(_host),
            };
        }
        catch (e) {
            throw new Error("Space metadata could not be loaded." + e.message);
        }
    }
    if (exports.RE_SPACE_DOMAIN.test(_app_reference)) {
        const { ws_protocol, http_protocol, host } = determine_protocol(_app_reference);
        return {
            space_id: host.replace(".hf.space", ""),
            ws_protocol,
            http_protocol,
            host,
        };
    }
    return {
        space_id: false,
        ...determine_protocol(_app_reference),
    };
}
function map_names_to_ids(fns) {
    let apis = {};
    fns.forEach(({ api_name }, i) => {
        if (api_name)
            apis[api_name] = i;
    });
    return apis;
}
const RE_DISABLED_DISCUSSION = /^(?=[^]*\b[dD]iscussions{0,1}\b)(?=[^]*\b[dD]isabled\b)[^]*$/;
async function discussions_enabled(space_id) {
    try {
        const r = await fetch(`https://huggingface.co/api/spaces/${space_id}/discussions`, {
            method: "HEAD",
        });
        const error = r.headers.get("x-error-message");
        if (error && RE_DISABLED_DISCUSSION.test(error))
            return false;
        else
            return true;
    }
    catch (e) {
        return false;
    }
}
async function get_space_hardware(space_id, token) {
    const headers = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    try {
        const res = await fetch(`https://huggingface.co/api/spaces/${space_id}/runtime`, { headers });
        if (res.status !== 200)
            throw new Error("Space hardware could not be obtained.");
        const { hardware } = await res.json();
        return hardware;
    }
    catch (e) {
        throw new Error(e.message);
    }
}
async function set_space_hardware(space_id, new_hardware, token) {
    const headers = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    try {
        const res = await fetch(`https://huggingface.co/api/spaces/${space_id}/hardware`, { headers, body: JSON.stringify(new_hardware) });
        if (res.status !== 200)
            throw new Error("Space hardware could not be set. Please ensure the space hardware provided is valid and that a Hugging Face token is passed in.");
        const { hardware } = await res.json();
        return hardware;
    }
    catch (e) {
        throw new Error(e.message);
    }
}
async function set_space_timeout(space_id, timeout, token) {
    const headers = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    try {
        const res = await fetch(`https://huggingface.co/api/spaces/${space_id}/hardware`, { headers, body: JSON.stringify({ seconds: timeout }) });
        if (res.status !== 200)
            throw new Error("Space hardware could not be set. Please ensure the space hardware provided is valid and that a Hugging Face token is passed in.");
        const { hardware } = await res.json();
        return hardware;
    }
    catch (e) {
        throw new Error(e.message);
    }
}
exports.hardware_types = [
    "cpu-basic",
    "cpu-upgrade",
    "t4-small",
    "t4-medium",
    "a10g-small",
    "a10g-large",
    "a100-large",
];
//# sourceMappingURL=utils.js.map