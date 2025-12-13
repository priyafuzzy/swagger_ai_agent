export type SpecSourceUrl = {
  type: 'url';
  url: string;
};

export type SpecSourceFile = {
  type: 'file';
  path: string;
};

export type SpecSourceGit = {
  type: 'git';
  repo: string;
  ref?: string;
  filePath: string;
};

export type SpecSource = SpecSourceUrl | SpecSourceFile | SpecSourceGit;

export type ImportSpecRequest = {
  source?: SpecSource;
  raw?: any;
};

export type ValidateSpecRequest = {
  specId?: string;
  spec?: any;
  specContent?: any;
};

export default {};
