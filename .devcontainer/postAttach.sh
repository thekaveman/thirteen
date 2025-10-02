#!/usr/bin/env bash
set -eu

# initialize pre-commit
git config --global --add safe.directory /home/node/app

# initialize hook environments
pre-commit install --install-hooks --overwrite

# manage commit-msg hooks
pre-commit install --hook-type commit-msg

# install node packages
npm install --dev
