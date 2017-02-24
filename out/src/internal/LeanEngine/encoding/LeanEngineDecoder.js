"use strict";
var LeanEngineDecoder = (function () {
    function LeanEngineDecoder(AVDecoder, AVObjectDecoder) {
        this._AVDecoder = AVDecoder;
        this._AVObjectDecoder = AVObjectDecoder;
    }
    LeanEngineDecoder.prototype.decodeAVObject = function (serverResponse) {
        return this._AVObjectDecoder.decode(serverResponse, this._AVDecoder);
    };
    LeanEngineDecoder.prototype.decodeDictionary = function (serverResponse) {
        return this._AVDecoder.decode(serverResponse);
    };
    return LeanEngineDecoder;
}());
exports.LeanEngineDecoder = LeanEngineDecoder;
