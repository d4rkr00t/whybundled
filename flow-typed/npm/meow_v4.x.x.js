// flow-typed signature: f5d9847e458bd606c77127cf49c79059
// flow-typed version: 21f83305e3/meow_v4.x.x/flow_>=v0.54.x

declare module "meow" {
  declare type MinimistOption =
    | "string"
    | "boolean"
    | {
        type?: "string" | "boolean",
        alias?: string | Array<string>,
        default?: any
      };

  declare type MinimistOptions = {
    stopEarly?: boolean,
    unknown?: (arg: string) => boolean,
    "--"?: boolean,
    [key: string]: MinimistOption
  };

  declare type Options = {|
    description?: string | boolean,
    help?: string | boolean,
    version?: string | boolean,
    pkg?: any,
    argv?: Array<string>,
    inferType?: boolean,
    flags?: MinimistOptions,
    autoHelp?: boolean,
    autoVersion?: boolean
  |};

  declare type Result = {
    input: Array<string>,
    flags: { [name: string]: any },
    pkg: Object,
    help: string,
    showHelp: (code?: number) => void,
    showVersion: () => void
  };

  declare type Meow = ((
    help: string | Array<string>,
    options: Options
  ) => Result) &
    ((options: string | Array<string> | Options) => Result);

  declare module.exports: Meow;
}
