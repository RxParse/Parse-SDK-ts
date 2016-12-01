export interface Options {
    cwd: string;
}
export interface DependenciesJson {
    [index: string]: {
        deps: {
            [index: string]: string;
        };
        peerDeps: {
            [index: string]: string;
        };
    };
}
export declare type Browser = string | Overrides;
export interface Overrides {
    [dependency: string]: string;
}
export interface JspmPackageJson {
    name: string;
    main: string;
    version?: string;
    typings?: string;
    browser?: Browser;
    browserTypings?: Browser;
    directories?: {
        baseURL: string;
        packages?: string;
    };
    configFiles?: ConfigFiles;
    dependencies?: {
        [index: string]: string;
    };
    peerDependencies?: {
        [index: string]: string;
    };
    devDependencie?: {
        [index: string]: string;
    };
    overrides?: {
        [index: string]: any;
    };
}
export interface JspmConfig {
    getDependencyTree(moduleName: string): any;
}
export interface ConfigFiles {
    jspm: string;
    'jspm:browser': string;
    'jspm:dev': string;
    'jspm:node': string;
}
export interface Configs {
    jspm?: any;
    browser?: any;
    dev?: any;
    node?: any;
}
export interface JspmProjectInfo {
    jspmPackageJson: JspmPackageJson;
    jspmConfigs: Configs;
    dependenciesJson?: DependenciesJson;
}
export interface PathMap {
    [prefix: string]: string;
}
export interface ModuleMap {
    [moduleName: string]: string;
}
export interface PackageMap {
    [versionedName: string]: {
        map: ModuleMap;
    };
}
export interface DependencyInfo {
    paths: PathMap;
    map: ModuleMap;
    packages: PackageMap;
}
export interface DependencyBranch {
    [moduleName: string]: DependencyTree;
}
export interface DependencyTree {
    path: string;
    map?: DependencyBranch;
}
