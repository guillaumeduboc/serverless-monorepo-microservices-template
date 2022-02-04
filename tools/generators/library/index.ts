/* eslint-disable max-lines */
import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  convertNxGenerator,
  formatFiles,
  generateFiles,
  GeneratorCallback,
  getWorkspaceLayout,
  installPackagesTask,
  joinPathFragments,
  names,
  offsetFromRoot,
  ProjectConfiguration,
  toJS,
  Tree,
  updateJson,
} from '@nrwl/devkit';
import { jestProjectGenerator } from '@nrwl/jest';
import { Linter, lintProjectGenerator } from '@nrwl/linter';
import { join } from 'path';
import { Schema } from './schema';

export interface NormalizedSchema extends Schema {
  name: string;
  fileName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
  importPath?: string;
}
const SOURCE_FOLDER = './files';
const nxVersion = '*';

const runTasksInSerial = (...tasks: GeneratorCallback[]): GeneratorCallback => {
  return async () => {
    for (const task of tasks) {
      await task();
    }
  };
};

const addProject = (tree: Tree, options: NormalizedSchema) => {
  const projectConfiguration: ProjectConfiguration = {
    root: options.projectRoot,
    sourceRoot: joinPathFragments(options.projectRoot, 'src'),
    projectType: 'library',
    targets: {},
    tags: options.parsedTags,
  };

  if (
    options.buildable === true &&
    projectConfiguration.targets !== undefined
  ) {
    const { libsDir } = getWorkspaceLayout(tree);
    addDependenciesToPackageJson(tree, {}, { '@nrwl/js': nxVersion });
    projectConfiguration.targets.build = {
      executor: '@nrwl/js:tsc',
      outputs: ['{options.outputPath}'],
      options: {
        outputPath: `dist/${libsDir}/${options.projectDirectory}`,
        main:
          `${options.projectRoot}/src/index` +
          (options.js === true ? '.js' : '.ts'),
        tsConfig: `${options.projectRoot}/tsconfig.lib.json`,
        assets: [`${options.projectRoot}/*.md`],
      },
    };
  }

  addProjectConfiguration(
    tree,
    options.name,
    projectConfiguration,
    options.standaloneConfig,
  );
};

export const addLint = (
  tree: Tree,
  options: NormalizedSchema,
): Promise<GeneratorCallback> => {
  return lintProjectGenerator(tree, {
    project: options.name,
    linter: options.linter,
    skipFormat: true,
    tsConfigPaths: [
      joinPathFragments(options.projectRoot, 'tsconfig.lib.json'),
    ],
    eslintFilePatterns: [
      `${options.projectRoot}/**/*.${options.js === true ? 'js' : 'ts'}`,
    ],
    setParserOptionsProject: options.setParserOptionsProject,
  });
};

type JsonType = {
  compilerOptions: {
    [key: string]: unknown;
    paths?: {
      [key: string]: unknown;
    };
  };
};

const updateTsConfig = (tree: Tree, options: NormalizedSchema) => {
  updateJson(
    tree,
    join(options.projectRoot, 'tsconfig.json'),
    (json: JsonType) => {
      if (options.strict === true) {
        json.compilerOptions = {
          ...json.compilerOptions,
          forceConsistentCasingInFileNames: true,
          strict: true,
          noImplicitReturns: true,
          noFallthroughCasesInSwitch: true,
        };
      }

      return json;
    },
  );
};

const updateRootTsConfig = (host: Tree, options: NormalizedSchema) => {
  updateJson(host, 'tsconfig.json', (json: JsonType) => {
    const c = json.compilerOptions;
    c.paths = c.paths ?? {};
    delete c.paths[options.name];

    if (
      options.importPath !== undefined &&
      c.paths[options.importPath] !== undefined
    ) {
      throw new Error(
        `You already have a library using the import path "${options.importPath}". Make sure to specify a unique one.`,
      );
    }

    if (options.importPath !== undefined) {
      c.paths[options.importPath] = [
        joinPathFragments(
          options.projectRoot,
          './src',
          'index.' + (options.js === true ? 'js' : 'ts'),
        ),
      ];
    }

    return json;
  });
};

const createFiles = (tree: Tree, options: NormalizedSchema) => {
  const { className, name, propertyName } = names(options.name);

  generateFiles(tree, join(__dirname, SOURCE_FOLDER), options.projectRoot, {
    ...options,
    dot: '.',
    className,
    name,
    propertyName,
    js: options.js === true,
    cliCommand: 'nx',
    strict: undefined,
    tmpl: '',
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    hasUnitTestRunner: options.unitTestRunner !== 'none',
  });

  if (options.unitTestRunner === 'none') {
    tree.delete(
      join(options.projectRoot, 'src/lib', `${options.fileName}.spec.ts`),
    );
  }

  if (options.skipBabelrc === true) {
    tree.delete(join(options.projectRoot, '.babelrc'));
  }

  if (options.js === true) {
    toJS(tree);
  }

  if (!(options.buildable === true)) {
    tree.delete(join(options.projectRoot, 'package.json'));
  }

  updateTsConfig(tree, options);
};

const addJest = async (
  tree: Tree,
  options: NormalizedSchema,
): Promise<GeneratorCallback> => {
  return await jestProjectGenerator(tree, {
    project: options.name,
    setupFile: 'none',
    supportTsx: true,
    babelJest: options.babelJest,
    skipSerializers: true,
    testEnvironment: options.testEnvironment,
    skipFormat: true,
  });
};

export const libraryGenerator = async (
  tree: Tree,
  schema: Schema,
): Promise<GeneratorCallback> => {
  const options = normalizeOptions(tree, schema);

  console.log('options', options);

  createFiles(tree, options);

  if (!(options.skipTsConfig === true)) {
    updateRootTsConfig(tree, options);
  }
  addProject(tree, options);

  const tasks: GeneratorCallback[] = [];

  if (options.linter !== 'none') {
    const lintCallback = await addLint(tree, options);
    tasks.push(lintCallback);
  }
  if (options.unitTestRunner === 'jest') {
    const jestCallback = await addJest(tree, options);
    tasks.push(jestCallback);
  }

  if (!(options.skipFormat === true)) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
};

export const librarySchematic = convertNxGenerator(libraryGenerator);

const normalizeOptions = (tree: Tree, options: Schema): NormalizedSchema => {
  console.log('tree', tree);

  const name = names(options.name).fileName;
  const projectDirectory =
    options.directory !== undefined && options.directory !== ''
      ? `${names(options.directory).fileName}/${name}`
      : name;

  if (!options.unitTestRunner) {
    options.unitTestRunner = 'jest';
  }

  if (!options.linter) {
    options.linter = Linter.EsLint;
  }

  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const fileName = getCaseAwareFileName({
    fileName: options.simpleModuleName === true ? name : projectName,
    pascalCaseFiles: options.pascalCaseFiles === true,
  });

  const { libsDir, npmScope } = getWorkspaceLayout(tree);
  console.log('libsDir', libsDir);
  console.log('npmScope', npmScope);

  const projectRoot = joinPathFragments(libsDir, projectDirectory);

  const parsedTags =
    options.tags !== undefined
      ? options.tags.split(',').map(s => s.trim())
      : [];

  const defaultImportPath = `@${npmScope}/${projectDirectory}`;
  const importPath = options.importPath ?? defaultImportPath;

  return {
    ...options,
    fileName,
    name: projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    importPath,
  };
};

const getCaseAwareFileName = (options: {
  pascalCaseFiles: boolean;
  fileName: string;
}) => {
  const normalized = names(options.fileName);

  return options.pascalCaseFiles ? normalized.className : normalized.fileName;
};

export default async (tree: Tree, schema: Schema): Promise<() => void> => {
  await libraryGenerator(tree, { name: schema.name });
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
  };
};
