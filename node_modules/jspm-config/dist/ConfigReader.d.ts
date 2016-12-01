import Promise = require('any-promise');
export declare class ConfigReader {
    private child;
    private timer;
    constructor();
    read(filePath: string): Promise<any>;
    close(): void;
    private startTimeBomb();
    private stopTimeBomb();
    private restartTimeBomb();
}
