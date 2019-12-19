# Token_Burn

## Pre-requisites

- Redis
- Mongodb
- Node, NPM
- Add keyConfig.js file containing address & privKey of the contract owner.

## Setup

- Latest build for react-ui is already provided, hence no need to build locally.
- By default build will be served as static, for dev environment, switch to dev in index.js

`npm i`<br/>
`cd client && npm i && npm run build && cd ../` ( optional ) <br/>

You can select the network on the start by running appropriate script.

- Apothem - `npm run start` or `npm run server`
- Mainnet - `npm run start-mainnet` or `npm run server-mainnet`

*Note*: Before running a given script ( apothem or mainnet ) make sure to have a config/keyConfig.js & config/contractConfig.js setup for it.

## Todo

- Add forgot password, change password
