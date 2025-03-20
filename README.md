## @brokenbyte-software/unserialize_php_session
A PHP session parser. `TS` implementation of https://github.com/ishantoz/unserialize_php_session

## Features
- **zero** dependencies!
- simple as possible

## Installion

* npm
```sh
npm i @brokenbyte-software/unserialize_php_session
```
* yarn
```sh
yarn add @brokenbyte-software/unserialize_php_session
```
* pnpm
```sh
pnpm install @brokenbyte-software/unserialize_php_session
```

## Usage
* TypeScript
```ts
import unserialize from '@brokenbyte-software/unserialize_php_session';

const result = unserialize('key|s:3:"foo";'); // result => {key: 'foo'}
```
* JavaScript
```js
const unserialize = require('@brokenbyte-software/unserialize_php_session');

const result = unserialize('key|s:3:"foo";'); // result => {key: 'foo'}
```
