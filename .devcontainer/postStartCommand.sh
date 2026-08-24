#!/bin/bash

// start webserver without cache on port 8080 and leave it running in background
nohup bash -c 'npx --yes http-server -c-1 > .nohup_webserver.out 2>&1 & rm nohup.out &' 
