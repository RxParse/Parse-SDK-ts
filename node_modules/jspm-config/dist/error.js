"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var make_error_cause_1 = require('make-error-cause');
var ConfigError = (function (_super) {
    __extends(ConfigError, _super);
    function ConfigError() {
        _super.apply(this, arguments);
    }
    return ConfigError;
}(make_error_cause_1.BaseError));
exports.ConfigError = ConfigError;
var ModuleNotFoundError = (function (_super) {
    __extends(ModuleNotFoundError, _super);
    function ModuleNotFoundError(moduleName) {
        _super.call(this, moduleName + " not found");
    }
    return ModuleNotFoundError;
}(make_error_cause_1.BaseError));
exports.ModuleNotFoundError = ModuleNotFoundError;
//# sourceMappingURL=error.js.map