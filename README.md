# Serverless Monorepo Microservices Template

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

This template aims to define an opinionated clean Serverless monorepo microservices architecture.

## Install

Head to [the install docs](./docs/install.md)!

If you need to setup your CI/CD: [docs](./docs/ci-cd.md)

## Features

- Lerna
- Eslint configuration
- Prettier configuration
- Jest configuration
- Typescript
- Common packages built with babel, with a watch mode
- Selective tests, package and deploy to remove the need to run all the tests and deploy at every commit.

## Code principles

This repository follows the code principles:

- **Your codebase should adapt to your team organizations**
- **DRY** (Don't Repeat Yourself)
- **Don't deploy all at once**
- **Safe deployments**

In order to respect these guidelines, a good solution is the Monorepo approach. See:

- [the Monorepo structure documentation](./docs/monorepo-structure.md)
- [the contracts documentation](https://github.com/fargito/serverless-contracts)

Tips:

- Always explicitely declare dependencies between end services in `package.json`
- These dependencies can be of two kinds:
  - code dependencies: _service B_ declares _service A_ as a dependency because it needs some code exported by _service A_;
  - deploy dependencies: _service B_ declares _service A_ as a dependency because it needs _service A_ to be deployed before it.

## Commands

These commands have to be run at the root of the project.

- `nvm use`: set the version of node set in `.nvmrc`
- `yarn`: install node dependencies in all packages;
- `yarn package`: compile the common packages;
- `yarn watch`: launch the compilation of all packages in watch mode;
- `yarn deploy`: deploy all the end services in order;

## Adding a new service

- Good idea!

## Other docs

- [serverless-contracts](https://github.com/fargito/serverless-contracts)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/fargito"><img src="https://avatars.githubusercontent.com/u/29537204?v=4?s=100" width="100px;" alt=""/><br /><sub><b>François Farge</b></sub></a><br /><a href="#infra-fargito" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/fargito/serverless-monorepo-microservices-template/commits?author=fargito" title="Code">💻</a> <a href="#ideas-fargito" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/fargito/serverless-monorepo-microservices-template/commits?author=fargito" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/adriencaccia"><img src="https://avatars.githubusercontent.com/u/19605940?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Adrien Cacciaguerra</b></sub></a><br /><a href="https://github.com/fargito/serverless-monorepo-microservices-template/commits?author=adriencaccia" title="Code">💻</a> <a href="#ideas-adriencaccia" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/LouisPinsard"><img src="https://avatars.githubusercontent.com/u/30240360?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Louis Pinsard</b></sub></a><br /><a href="https://github.com/fargito/serverless-monorepo-microservices-template/commits?author=LouisPinsard" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
