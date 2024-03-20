#!/bin/bash
npm install
npm link oidc-client-ts
npm run build
cd example
npm run build
npm run start
cd ..