"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LeanEngineDecoder {
    constructor(AVDecoder, AVObjectDecoder) {
        this._AVDecoder = AVDecoder;
        this._AVObjectDecoder = AVObjectDecoder;
    }
    decodeAVObject(serverResponse) {
        return this._AVObjectDecoder.decode(serverResponse, this._AVDecoder);
    }
    decodeDictionary(serverResponse) {
        return this._AVDecoder.decode(serverResponse);
    }
}
exports.LeanEngineDecoder = LeanEngineDecoder;
