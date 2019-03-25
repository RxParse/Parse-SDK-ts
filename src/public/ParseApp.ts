export class ParseAppConfig {
    appId: string;
    serverURL: string;
    appKey?: string;
    masterKey?: string;
    shortName?: string;
    additionalHeaders?: { [key: string]: any };
}

/**
 * 
 * 
 * @export
 * @class ParseApp
 */
export class ParseApp {

    constructor(options: ParseAppConfig) {
        this.appId = options.appId;
        this.serverURL = options.serverURL;
        this.appKey = options.appKey;
        this.masterKey = options.masterKey;
        this.shortName = options.shortName;
        this.additionalHeaders = options.additionalHeaders;
    }
    shortName: string;
    appId: string;
    appKey: string;
    serverURL: string;
    masterKey: string;
    additionalHeaders?: { [key: string]: any };

    get pureServerURL(): string {
        return this.clearTailSlashes(this.serverURL);
    }

    get mountPath(): string {
        return this.pureServerURL.replace(/^(?:\/\/|[^\/]+)*\//, "")
    }

    clearTailSlashes(url: string): string {
        if (url.endsWith('/')) {
            url = url.substring(0, url.length - 1);
            return this.clearTailSlashes(url);
        } else
            return url;
    }

    get httpHeaders() {
        let headers: { [key: string]: any } = {};
        headers = {
            'X-Parse-Application-Id': this.appId,
            'Content-Type': 'application/json;charset=utf-8'
        };
        if (this.appKey) {
            headers['X-Parse-Javascript-Key'] = this.appKey;
        }
        if (this.masterKey) {
            headers['X-Parse-Master-Key'] = this.masterKey;
        }

        if (this.additionalHeaders) {
            for (let key in this.additionalHeaders) {
                headers[key] = this.additionalHeaders[key];
            }
        }
        return headers;
    }
}
