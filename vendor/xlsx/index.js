function unsupported(){ throw new Error('The vendored xlsx placeholder does not implement Excel parsing. Install the upstream xlsx package before enabling Excel import.'); }
module.exports = { read: unsupported, utils: { sheet_to_json: unsupported } };
