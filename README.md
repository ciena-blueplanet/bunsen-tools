[ci-img]: https://img.shields.io/travis/ciena-blueplanet/bunsen-tools.svg "Travis CI Build Status"
[ci-url]: https://travis-ci.org/ciena-blueplanet/bunsen-tools
[cov-img]: https://img.shields.io/coveralls/ciena-blueplanet/bunsen-tools.svg "Coveralls Code Coverage"
[cov-url]: https://coveralls.io/github/ciena-blueplanet/bunsen-tools
[npm-img]: https://img.shields.io/npm/v/bunsen-tools.svg "NPM Version"
[npm-url]: https://www.npmjs.com/package/bunsen-tools
  
# bunsen-tools <br /> [![Travis][ci-img]][ci-url] [![Coveralls][cov-img]][cov-url] [![NPM][npm-img]][npm-url]
 

## Installation

> Note: In order to use **bunsen-tools** you will need to have [Node](https://nodejs.org/en/download/package-manager/) installed.

Once you have Node installed you can run the following command to install **bunsen-tools**:

```bash
npm install -g bunsen-tools
```


## Usage

Below is a list of the possible commands you can use with the **bunsen-tools** CLI.
This usage information can also be obtained by running the following command:

```bash
bunsen --help
```

or by running the shorthand:

```bash
bunsen -h
```

> Note: Both view and model files provided to the following commands must be in JSON format.

### convert

To convert old view formats to the latest view schema (UI Schema 2), simply run the following command:

```bash
bunsen convert <legacyViewFile>
```

You may also use the shorthand command:

```bash
bunsen c <legacyViewFile>
```

### validate

In order to validate a Bunsen model or view simply run the following command:

```bash
bunsen validate <modelOrViewFile>
```

You may also use the shorthand command:

```bash
bunsen v <modelOrViewFile>
```

You can also validate a view against a model by running:

```bash
bunsen validate <viewFile> <modelFile>
```

### version

To get the current version of **bunsen-tools** simply run:

```bash
bunsen --version
```

or the shorthand:

```bash
bunsen -V
```
