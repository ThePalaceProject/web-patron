// Ignore imported stylesheets.
let noop = () => {};
require.extensions[".scss"] = noop;
